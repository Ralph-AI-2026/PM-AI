#!/usr/bin/env python3
"""
gate_descriptions.py -- Mechanical gate for the US directory LLM-generated
listing descriptions. STAGE ONLY. Never touches the live database.

Pipeline:
  1. Load the export CSV (ground truth for id existence + current description
     + number_of_lanes) -- read-only.
  2. Load the source chunk files (real DB fields used to write each
     description) -- read-only, used for the lane cross-check and the
     spot-check trace.
  3. Load all 42 result JSONL files (the LLM output) -- read-only.
  4. Apply DROP checks (id-verbatim, dedup, malformed) and FLAG checks
     (length, fabrication heuristics, em dash, quote hygiene) per row.
  5. Split kept rows into THIN / RICH scope sets based on the export CSV's
     current `description` column.
  6. Write kept-thin.jsonl / kept-rich.jsonl, gate-report.md, and batched
     guarded UPDATE SQL files (100 tuples each).

No row is ever rewritten, improved, or paraphrased by this script. Dropped
rows are dropped with a reason. Flagged rows stay in the kept set (they are
still written to the JSONL/SQL) but are surfaced in the report for a human
to review.
"""

import csv
import glob
import json
import random
import re
import sys
from collections import defaultdict, OrderedDict

RUN_DATE = "2026-07-06"
SEED = 20260706

BASE = "/mnt/c/Users/jrpke/Downloads/archery-ranges-usa"
TONY_WORK = f"{BASE}/tony-work"
DESC_DIR = f"{TONY_WORK}/descriptions"
RESULTS_GLOB = f"{DESC_DIR}/results/d-*.out.jsonl"
CHUNKS_GLOB = f"{DESC_DIR}/chunks/d-*.jsonl"
EXPORT_CSV = f"{BASE}/us-listings-export-2026-07-06.csv"
GATE_DIR = f"{DESC_DIR}/gate"

THIN_RE = re.compile(r"^Archery range located in", re.IGNORECASE)

DOLLAR_RE = re.compile(r"\$\s?\d")
CLOCK_TIME_RE = re.compile(
    r"\b\d{1,2}(:\d{2})?\s?(a\.?m\.?|p\.?m\.?)\b|\b\d{1,2}:\d{2}\b",
    re.IGNORECASE,
)
PHONE_RE = re.compile(r"\b\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b")
DAY_RE = re.compile(
    r"\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b",
    re.IGNORECASE,
)
HOURS_WORD_RE = re.compile(r"\b(open|opens|opening|closed|closes|hours?)\b", re.IGNORECASE)
LANE_CLAIM_RE = re.compile(r"\b(\d+)\s*-?\s*(lanes?)\b", re.IGNORECASE)
SUPERLATIVE_TOKENS = ["award-winning", "best in", "largest", "renowned"]
EM_DASH = "—"


def load_export_csv(path):
    rows = OrderedDict()
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows[row["id"]] = row
    return rows


def load_chunks(pattern):
    chunks = {}
    files = sorted(glob.glob(pattern))
    for fp in files:
        with open(fp, encoding="utf-8") as f:
            for lineno, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                chunks[obj.get("id")] = obj
    return chunks


def normalize_text(text):
    """Whitespace-only hygiene. Never rewrites content."""
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ").replace("\t", " ")
    text = text.strip()
    return text


def sql_escape(text):
    """Standard SQL single-quote doubling. Double quotes are left untouched
    since they never terminate a single-quoted Postgres string literal."""
    return text.replace("'", "''")


def check_lane_mismatch(text, csv_row):
    """Return a list of (claimed, csv_value) mismatch tuples, or [] if clean."""
    claims = [int(m.group(1)) for m in LANE_CLAIM_RE.finditer(text)]
    if not claims:
        return []
    csv_val_raw = (csv_row.get("number_of_lanes") or "").strip()
    csv_val = int(csv_val_raw) if csv_val_raw.isdigit() else None
    mismatches = []
    for claimed in claims:
        if csv_val is None or csv_val != claimed:
            mismatches.append((claimed, csv_val_raw or "EMPTY"))
    return mismatches


def gate():
    export_rows = load_export_csv(EXPORT_CSV)
    valid_ids = set(export_rows.keys())
    chunks = load_chunks(CHUNKS_GLOB)

    result_files = sorted(glob.glob(RESULTS_GLOB))

    counts = {
        "input_lines": 0,
        "kept": 0,
        "dropped": defaultdict(int),
        "flagged": defaultdict(int),
    }

    dropped_entries = []       # list of dict(id, reason, source, snippet)
    flagged_entries = []       # list of dict(id, reasons=[...], snippet, detail)
    seen_ids = set()

    kept_thin = []   # (id, description)
    kept_rich = []   # (id, description)

    for fp in result_files:
        fname = fp.split("/")[-1]
        with open(fp, encoding="utf-8") as f:
            for lineno, line in enumerate(f, 1):
                raw = line.rstrip("\n")
                if not raw.strip():
                    continue
                counts["input_lines"] += 1
                source_ref = f"{fname}:{lineno}"

                try:
                    obj = json.loads(raw)
                except json.JSONDecodeError as e:
                    counts["dropped"]["malformed-json"] += 1
                    dropped_entries.append({
                        "id": "UNKNOWN", "reason": "malformed-json",
                        "source": source_ref, "snippet": raw[:80],
                    })
                    continue

                rid = obj.get("id")
                desc_raw = obj.get("description")

                if not rid or not isinstance(rid, str):
                    counts["dropped"]["missing-id"] += 1
                    dropped_entries.append({
                        "id": str(rid), "reason": "missing-id",
                        "source": source_ref, "snippet": raw[:80],
                    })
                    continue

                if not desc_raw or not isinstance(desc_raw, str) or not desc_raw.strip():
                    counts["dropped"]["missing-description"] += 1
                    dropped_entries.append({
                        "id": rid, "reason": "missing-description",
                        "source": source_ref, "snippet": "",
                    })
                    continue

                # a. ID VERBATIM CHECK
                if rid not in valid_ids:
                    counts["dropped"]["unknown-id"] += 1
                    dropped_entries.append({
                        "id": rid, "reason": "unknown-id/fabricated",
                        "source": source_ref, "snippet": desc_raw[:80],
                    })
                    continue

                # b. DEDUP -- keep first, drop (flag) the rest
                if rid in seen_ids:
                    counts["dropped"]["duplicate-id"] += 1
                    dropped_entries.append({
                        "id": rid, "reason": "duplicate-id (kept first occurrence)",
                        "source": source_ref, "snippet": desc_raw[:80],
                    })
                    continue
                seen_ids.add(rid)

                text = normalize_text(desc_raw)
                row_flags = []

                # c. LENGTH SANITY
                length = len(text)
                if not (200 <= length <= 1200):
                    row_flags.append(("length-out-of-range", f"len={length}"))

                # d. FABRICATION HEURISTICS
                if DOLLAR_RE.search(text):
                    m = DOLLAR_RE.search(text)
                    row_flags.append(("dollar-amount", text[max(0, m.start()-15):m.end()+15]))

                if CLOCK_TIME_RE.search(text):
                    m = CLOCK_TIME_RE.search(text)
                    row_flags.append(("clock-time", text[max(0, m.start()-15):m.end()+15]))

                if PHONE_RE.search(text):
                    m = PHONE_RE.search(text)
                    row_flags.append(("phone-number", text[max(0, m.start()-15):m.end()+15]))

                if DAY_RE.search(text) and HOURS_WORD_RE.search(text):
                    dm = DAY_RE.search(text)
                    row_flags.append(("day-of-week-hours-phrasing",
                                       text[max(0, dm.start()-15):dm.end()+30]))

                lane_mismatches = check_lane_mismatch(text, export_rows[rid])
                for claimed, csv_val in lane_mismatches:
                    row_flags.append(("lane-count-mismatch",
                                       f"description claims {claimed} lanes; "
                                       f"export CSV number_of_lanes={csv_val}"))

                lowered = text.lower()
                for token in SUPERLATIVE_TOKENS:
                    if token in lowered:
                        idx = lowered.find(token)
                        row_flags.append(("superlative-claim",
                                           text[max(0, idx-15):idx+len(token)+15]))

                # e. TEXT HYGIENE -- em dash (house style violation, flag not drop)
                if EM_DASH in text:
                    idx = text.find(EM_DASH)
                    row_flags.append(("em-dash", text[max(0, idx-15):idx+15]))

                if row_flags:
                    counts["flagged"]["rows-with-any-flag"] += 1
                    for reason, snippet in row_flags:
                        counts["flagged"][reason] += 1
                    flagged_entries.append({
                        "id": rid,
                        "reasons": [r for r, _ in row_flags],
                        "details": row_flags,
                    })

                # f. SCOPE TAGGING (THIN vs RICH) from export CSV current description
                current_desc = (export_rows[rid].get("description") or "").strip()
                is_thin = (current_desc == "") or bool(THIN_RE.match(current_desc))

                counts["kept"] += 1
                if is_thin:
                    kept_thin.append((rid, text))
                else:
                    kept_rich.append((rid, text))

    return {
        "counts": counts,
        "dropped_entries": dropped_entries,
        "flagged_entries": flagged_entries,
        "kept_thin": kept_thin,
        "kept_rich": kept_rich,
        "export_rows": export_rows,
        "chunks": chunks,
    }


def write_jsonl(path, rows):
    with open(path, "w", encoding="utf-8") as f:
        for rid, desc in rows:
            f.write(json.dumps({"id": rid, "description": desc}, ensure_ascii=False) + "\n")


def write_sql_batches(rows, prefix, scope_label):
    """House style matching photo-gate/apply/batch-NN.sql: one UPDATE per file,
    VALUES tuple batch, guarded WHERE, description only (no updated_at bump
    per the exact hard-rule instruction)."""
    batch_size = 100
    file_counts = []
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        batch_no = i // batch_size + 1
        fname = f"{GATE_DIR}/{prefix}-batch-{batch_no:02d}.sql"
        tuples = []
        for rid, desc in batch:
            tuples.append(f"('{rid}','{sql_escape(desc)}')")
        values_clause = ",\n  ".join(tuples)
        sql = (
            f"-- {prefix}-batch-{batch_no:02d}.sql\n"
            f"-- Generated {RUN_DATE} | scope: {scope_label} | rows: {len(batch)}\n"
            f"-- STAGED ONLY -- not yet applied. Guarded: is_claimed = false, id must match.\n"
            f"-- Sets description only, per hard rule 4 (no other column touched).\n"
            f"UPDATE public.ranges AS r\n"
            f"SET description = v.description\n"
            f"FROM (VALUES\n  {values_clause}\n) AS v(id, description)\n"
            f"WHERE r.id = v.id::uuid AND r.is_claimed = false;\n"
        )
        with open(fname, "w", encoding="utf-8") as f:
            f.write(sql)
        file_counts.append((fname.split("/")[-1], len(batch)))
    return file_counts


def spot_check_sample(kept_thin, kept_rich, chunks, export_rows, n=5, seed=SEED):
    all_kept = kept_thin + kept_rich
    rng = random.Random(seed)
    sample = rng.sample(all_kept, n)
    out = []
    for rid, desc in sample:
        chunk = chunks.get(rid, {})
        csv_row = export_rows.get(rid, {})
        out.append({
            "id": rid,
            "description": desc,
            "chunk": chunk,
            "csv_row": {k: csv_row.get(k) for k in [
                "name", "city", "state", "facility_type", "has_pro_shop",
                "has_3d_course", "has_field_course", "lessons_available",
                "number_of_lanes", "range_length_yards", "description",
            ]},
        })
    return out


def main():
    result = gate()
    counts = result["counts"]
    kept_thin = result["kept_thin"]
    kept_rich = result["kept_rich"]

    write_jsonl(f"{GATE_DIR}/kept-thin.jsonl", kept_thin)
    write_jsonl(f"{GATE_DIR}/kept-rich.jsonl", kept_rich)

    thin_files = write_sql_batches(kept_thin, "desc-thin", "THIN")
    rich_files = write_sql_batches(kept_rich, "desc-rich", "RICH")

    spot = spot_check_sample(kept_thin, kept_rich, result["chunks"], result["export_rows"])

    # Dump spot-check raw data for the human trace step (not the final verdicts --
    # those are written by hand into gate-report.md after actually reading them).
    with open(f"{GATE_DIR}/spot-check-sample.json", "w", encoding="utf-8") as f:
        json.dump(spot, f, indent=2, ensure_ascii=False)

    # Arithmetic verification
    thin_tuple_total = sum(c for _, c in thin_files)
    rich_tuple_total = sum(c for _, c in rich_files)

    summary = {
        "input_lines": counts["input_lines"],
        "kept": counts["kept"],
        "dropped_total": sum(counts["dropped"].values()),
        "dropped_by_reason": dict(counts["dropped"]),
        "flagged_by_reason": dict(counts["flagged"]),
        "kept_thin": len(kept_thin),
        "kept_rich": len(kept_rich),
        "thin_files": thin_files,
        "rich_files": rich_files,
        "thin_tuple_total": thin_tuple_total,
        "rich_tuple_total": rich_tuple_total,
        "thin_tuple_total_matches": thin_tuple_total == len(kept_thin),
        "rich_tuple_total_matches": rich_tuple_total == len(kept_rich),
    }

    with open(f"{GATE_DIR}/gate-summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(json.dumps(summary, indent=2))

    # dump full flagged/dropped entries for report-writing
    with open(f"{GATE_DIR}/flagged-entries.json", "w", encoding="utf-8") as f:
        json.dump(result["flagged_entries"], f, indent=2, ensure_ascii=False)
    with open(f"{GATE_DIR}/dropped-entries.json", "w", encoding="utf-8") as f:
        json.dump(result["dropped_entries"], f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
