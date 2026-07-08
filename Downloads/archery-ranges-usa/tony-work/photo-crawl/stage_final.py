#!/usr/bin/env python3
"""stage_final.py -- merge gate2 verdicts, produce keeps.jsonl / holds.jsonl / apply SQL.

STAGE ONLY. Guards baked into every UPDATE:
  is_claimed=false AND post_images LIKE '%unsplash%'
"""
import json
from pathlib import Path

WORKDIR = Path(__file__).parent.resolve()
APPLY_DIR = WORKDIR / "apply"
APPLY_DIR.mkdir(exist_ok=True)
BATCH_SIZE = 100

manifest = {}
order = []
for line in (WORKDIR / "gate2-manifest.jsonl").read_text().splitlines():
    if line.strip():
        m = json.loads(line)
        manifest[m["id"]] = m
        order.append(m["id"])

verdicts = {}
for out in sorted((WORKDIR / "gate2-results").glob("g2-*.out.jsonl")):
    for line in out.read_text().splitlines():
        if line.strip():
            v = json.loads(line)
            verdicts[v["id"]] = v

# Tony spot-check overrides (2026-07-06 audit of gate2 output): id -> hold reason
OVERRIDE_HOLD = {
    "50c929cd-f699-417d-8a82-3e2569ef4cb4":  # Wylie Karate Archery Club
        "real venue photo but shows a karate class, no archery visible - Josh call",
}

keeps, holds = [], []
missing = []
seen_urls = {}
for rid in order:
    m = manifest[rid]
    v = verdicts.get(rid)
    if v is None:
        missing.append(rid)
        holds.append({**m, "hold_reason": "no gate2 verdict returned"})
        continue
    if rid in OVERRIDE_HOLD:
        holds.append({**m, "hold_reason": f"tony override: {OVERRIDE_HOLD[rid]}"})
        continue
    if v["verdict"] == "keep":
        # final reuse enforcement: same URL kept for 2+ ranges -> keep first, hold rest
        if m["image_url"] in seen_urls:
            holds.append({**m, "hold_reason": f"same URL already kept for {seen_urls[m['image_url']]}"})
            continue
        seen_urls[m["image_url"]] = m["name"]
        keeps.append({**m, "kind": v.get("kind"), "gate2_reason": v.get("reason")})
    else:
        holds.append({**m, "hold_reason": f"gate2 reject: {v.get('reason')}"})

with open(WORKDIR / "keeps.jsonl", "w") as f:
    for k in keeps:
        f.write(json.dumps(k) + "\n")
with open(WORKDIR / "holds.jsonl", "w") as f:
    for h in holds:
        f.write(json.dumps(h) + "\n")

# SQL staging, house style. fbcdn URLs are SIGNED + EXPIRING (oe= param) --
# staged separately; they should be REHOSTED before any apply.
def sql_escape(s):
    return s.replace("'", "''")

stable = [k for k in keeps if "fbcdn.net" not in k["image_url"]]
fbcdn = [k for k in keeps if "fbcdn.net" in k["image_url"]]

def write_batches(rows, prefix, warn=None):
    for bi in range(0, len(rows), BATCH_SIZE):
        batch = rows[bi:bi + BATCH_SIZE]
        n = bi // BATCH_SIZE + 1
        lines = [
            f"-- photo-crawl pilot TX/OH {prefix} batch {n:02d} ({len(batch)} rows) staged {__import__('datetime').date.today()}",
            "-- STAGE ONLY - do not run without Josh/Tony approval",
        ]
        if warn:
            lines.append(f"-- WARNING: {warn}")
        for k in batch:
            img_json = json.dumps([k["image_url"]])
            lines.append(
                f"UPDATE public.ranges SET post_images='{sql_escape(img_json)}', updated_at=now() "
                f"WHERE id='{k['id']}' AND is_claimed=false AND post_images LIKE '%unsplash%'; "
                f"-- {k['name']} ({k['state']})"
            )
        (APPLY_DIR / f"{prefix}-batch-{n:02d}.sql").write_text("\n".join(lines) + "\n")

write_batches(stable, "stable")
write_batches(fbcdn, "fbcdn",
              warn="these image URLs are SIGNED Facebook CDN links with an expiry (oe=) param; "
                   "they WILL 403 in weeks. REHOST to Supabase storage before applying.")

print(f"keeps={len(keeps)} (stable={len(stable)}, fbcdn={len(fbcdn)}) holds={len(holds)} missing_verdicts={len(missing)}")
if missing:
    print("missing:", missing)
