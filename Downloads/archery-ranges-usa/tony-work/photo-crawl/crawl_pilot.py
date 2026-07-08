#!/usr/bin/env python3
"""
crawl_pilot.py -- TX/OH own-site photo pilot (mini-fable5: acquire -> extract -> gate -> stage).

Sequential, one row at a time (RAM discipline). Uses arlen-crawl (crawl4ai) to
render each range's own website/Facebook page, extracts og:image/twitter:image/
gallery <img> candidates via regex (NOT another scraper -- just parsing the HTML
arlen-crawl already fetched), HEAD-checks each candidate, and applies a code gate.

NO DB WRITES. Stages keeps.jsonl / holds.jsonl / apply SQL only.
"""
import html as html_mod
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

WORKDIR = Path(__file__).parent.resolve()
EVIDENCE_DIR = WORKDIR / "evidence"
ARLEN_BIN = "/home/jrpkennedy/arlen-crawl/.venv/bin/arlen-crawl"

SCRAPE_TIMEOUT_S = 45          # subprocess wall-clock backstop per crawl
ARLEN_INTERNAL_TIMEOUT_MS = 25000
HEAD_TIMEOUT_S = 8
SLEEP_BETWEEN_ROWS_S = 2
MAX_IMG_CANDIDATES = 15         # cap HEAD checks per page
MIN_BYTES = 15000               # 15KB proxy for "not a thumbnail/icon"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

BAD_EXT = (".svg", ".ico", ".gif")

FILENAME_JUNK_PATTERNS = [
    "logo", "icon", "favicon", "sprite", "spacer", "pixel.", "placeholder",
    "badge", "seal", "avatar", "profile-default", "default_profile",
    "no-image", "noimage", "blank.png", "header-bg", "nav-", "menu-icon",
    "button", "arrow-", "loader", "loading.gif", "close-icon", "search-icon",
    "cart-icon", "social-icon", "facebook-icon", "twitter-icon", "instagram-icon",
    "apple-touch-icon", "safari-pinned-tab", "og-default", "sharethis",
]

PLATFORM_DEFAULT_PATTERNS = [
    "wixstatic.com/media/blank", "squarespace-cdn.com/content/v1/.../default",
    "wp-content/themes", "gravatar.com/avatar",  # gravatar default avatars
    "facebook.com/rsrc.php",  # FB chrome assets (not photos)
    "static.xx.fbcdn.net/rsrc.php",
    "silhouette",
]

DEAD_SITE_MARKERS = [
    "domain may be for sale", "this domain is for sale", "buy this domain",
    "domain parking", "parked free", "godaddy.com/domains", "future home of something",
    "namecheap parking", "under construction", "coming soon", "index of /",
]

PARKED_MIN_HTML_BYTES = 800  # suspiciously tiny page


def sh_scrape(url: str, out_path: Path) -> tuple[bool, str]:
    """Run arlen-crawl scrape -f html. Returns (ok, error_reason)."""
    try:
        proc = subprocess.run(
            [ARLEN_BIN, "scrape", url, "-f", "html", "-o", str(out_path),
             "-q", "-t", str(ARLEN_INTERNAL_TIMEOUT_MS)],
            capture_output=True, text=True, timeout=SCRAPE_TIMEOUT_S,
        )
        if proc.returncode != 0:
            err = (proc.stderr or proc.stdout or "unknown error").strip()[:300]
            return False, f"arlen-crawl exit {proc.returncode}: {err}"
        if not out_path.exists() or out_path.stat().st_size == 0:
            return False, "empty output"
        return True, ""
    except subprocess.TimeoutExpired:
        return False, f"subprocess timeout >{SCRAPE_TIMEOUT_S}s"
    except Exception as e:
        return False, f"exception: {e}"


def is_dead_or_parked(html_text: str) -> str | None:
    if len(html_text) < PARKED_MIN_HTML_BYTES:
        return f"tiny page ({len(html_text)} bytes)"
    lower = html_text.lower()
    for marker in DEAD_SITE_MARKERS:
        if marker in lower:
            return f"dead/parked marker: '{marker}'"
    return None


def extract_candidates(html_text: str, base_url: str) -> list[dict]:
    """Return ordered list of {'url', 'tag'} candidates: og:image, twitter:image, then <img> srcs."""
    candidates = []
    seen = set()

    def add(url, tag):
        if not url:
            return
        url = html_mod.unescape(url.strip())
        if url.startswith("//"):
            url = "https:" + url
        elif url.startswith("/"):
            url = urllib.parse.urljoin(base_url, url)
        elif not url.startswith("http"):
            url = urllib.parse.urljoin(base_url, url)
        if url in seen:
            return
        seen.add(url)
        candidates.append({"url": url, "tag": tag})

    for m in re.finditer(r'<meta[^>]+(?:property|name)=["\']og:image(?::secure_url)?["\'][^>]+content=["\']([^"\']+)["\']', html_text, re.I):
        add(m.group(1), "og:image")
    for m in re.finditer(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:image(?::secure_url)?["\']', html_text, re.I):
        add(m.group(1), "og:image")
    for m in re.finditer(r'<meta[^>]+(?:property|name)=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']', html_text, re.I):
        add(m.group(1), "twitter:image")

    img_count = 0
    for m in re.finditer(r'<img\b[^>]*?\bsrc=["\']([^"\']+)["\']', html_text, re.I):
        if img_count >= MAX_IMG_CANDIDATES:
            break
        add(m.group(1), "img")
        img_count += 1

    return candidates


def filename_is_junk(url: str) -> str | None:
    path_lower = urllib.parse.urlparse(url).path.lower()
    for ext in BAD_EXT:
        if path_lower.endswith(ext):
            return f"bad ext {ext}"
    for pat in FILENAME_JUNK_PATTERNS:
        if pat in path_lower:
            return f"filename junk pattern '{pat}'"
    url_lower = url.lower()
    for pat in PLATFORM_DEFAULT_PATTERNS:
        if pat in url_lower:
            return f"platform default pattern '{pat}'"
    return None


def head_check(url: str) -> dict:
    """Return {'ok', 'content_type', 'content_length', 'method', 'reason'}"""
    req_headers = {"User-Agent": UA, "Accept": "image/*,*/*"}
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, headers=req_headers, method=method)
            resp = urllib.request.urlopen(req, timeout=HEAD_TIMEOUT_S)
            status = resp.status
            ctype = resp.headers.get("Content-Type", "")
            clen = resp.headers.get("Content-Length")
            resp.close()
            if status != 200:
                continue
            if not ctype.startswith("image/"):
                return {"ok": False, "reason": f"not image/* (got {ctype or 'none'})",
                        "method": method, "content_type": ctype, "content_length": clen}
            if "svg" in ctype or "gif" in ctype:
                return {"ok": False, "reason": f"rejected content-type {ctype}",
                        "method": method, "content_type": ctype, "content_length": clen}
            clen_int = int(clen) if clen and clen.isdigit() else None
            if clen_int is not None and clen_int < MIN_BYTES:
                return {"ok": False, "reason": f"too small ({clen_int}B < {MIN_BYTES}B, method={method})",
                        "method": method, "content_type": ctype, "content_length": clen}
            return {"ok": True, "reason": "", "method": method,
                    "content_type": ctype, "content_length": clen}
        except Exception as e:
            last_err = str(e)
            continue
    return {"ok": False, "reason": f"HEAD/GET failed: {last_err if 'last_err' in dir() else 'unknown'}",
            "method": "none", "content_type": None, "content_length": None}


def process_source(url: str, source_label: str, tmp_html: Path) -> dict:
    """Scrape one URL, return dict with reachable/candidates/chosen/evidence."""
    result = {
        "source": source_label, "url": url, "reachable": False,
        "fail_reason": None, "candidates_found": 0, "candidates": [],
        "chosen": None, "dead_or_parked": None,
    }
    ok, err = sh_scrape(url, tmp_html)
    if not ok:
        result["fail_reason"] = err
        return result
    result["reachable"] = True
    try:
        html_text = tmp_html.read_text(errors="ignore")
    except Exception as e:
        result["fail_reason"] = f"read error: {e}"
        result["reachable"] = False
        return result

    dead = is_dead_or_parked(html_text)
    if dead:
        result["dead_or_parked"] = dead
        return result

    raw_candidates = extract_candidates(html_text, url)
    checked = []
    for c in raw_candidates:
        junk_reason = filename_is_junk(c["url"])
        entry = {"url": c["url"], "tag": c["tag"]}
        if junk_reason:
            entry["gate"] = "reject"
            entry["gate_reason"] = junk_reason
        else:
            hc = head_check(c["url"])
            entry["gate"] = "pass" if hc["ok"] else "reject"
            entry["gate_reason"] = hc["reason"] or "ok"
            entry["content_type"] = hc.get("content_type")
            entry["content_length"] = hc.get("content_length")
            entry["head_method"] = hc.get("method")
        checked.append(entry)
    result["candidates"] = checked
    result["candidates_found"] = len(checked)

    passing = [c for c in checked if c["gate"] == "pass"]
    chosen = None
    for tag_priority in ("og:image", "twitter:image"):
        for c in passing:
            if c["tag"] == tag_priority:
                chosen = c
                break
        if chosen:
            break
    if not chosen and passing:
        def size_key(c):
            try:
                return int(c.get("content_length") or 0)
            except Exception:
                return 0
        chosen = sorted(passing, key=size_key, reverse=True)[0]
    result["chosen"] = chosen
    return result


def process_row(row: dict, state: str) -> dict:
    rid = row["id"]
    tmp_html = WORKDIR / f"_tmp_{state}_{rid}.html"
    evidence = {"id": rid, "name": row["name"], "city": row.get("city"), "state": state,
                "website": row.get("website"), "facebook_url": row.get("facebook_url"),
                "attempts": []}

    verdict = None  # 'kept' | 'held' | 'dropped'
    chosen_url = None
    chosen_source_page = None
    drop_reason = None

    sources_to_try = []
    if row.get("website"):
        sources_to_try.append(("website", row["website"]))
    if row.get("facebook_url"):
        sources_to_try.append(("facebook", row["facebook_url"]))

    if not sources_to_try:
        evidence["outcome"] = "no_source"
        drop_reason = "no website or facebook_url"
    else:
        for label, url in sources_to_try:
            attempt = process_source(url, label, tmp_html)
            evidence["attempts"].append(attempt)
            if tmp_html.exists():
                try:
                    tmp_html.unlink()
                except Exception:
                    pass
            if attempt["chosen"]:
                chosen_url = attempt["chosen"]["url"]
                chosen_source_page = url
                break
            # if website reachable but dead/parked, still may fall through to FB
        if not chosen_url:
            # figure out drop reason from last useful signal
            last = evidence["attempts"][-1]
            if last.get("dead_or_parked"):
                drop_reason = f"dead/parked: {last['dead_or_parked']}"
            elif not last["reachable"]:
                drop_reason = f"unreachable: {last['fail_reason']}"
            elif last["candidates_found"] == 0:
                drop_reason = "no img/og:image tags found"
            else:
                drop_reason = "all candidates failed gate"

    if chosen_url:
        verdict = "kept"
    else:
        verdict = "dropped"

    evidence["verdict_pregate2"] = verdict
    evidence["chosen_url"] = chosen_url
    evidence["chosen_source_page"] = chosen_source_page
    evidence["drop_reason"] = drop_reason

    ev_path = EVIDENCE_DIR / f"{state}-{rid}.json"
    ev_path.write_text(json.dumps(evidence, indent=2))

    return {
        "id": rid, "name": row["name"], "city": row.get("city"), "state": state,
        "chosen_url": chosen_url, "chosen_source_page": chosen_source_page,
        "verdict_pregate2": verdict, "drop_reason": drop_reason,
        "evidence_path": str(ev_path),
    }


def main():
    if len(sys.argv) < 2:
        print("usage: crawl_pilot.py <targets.jsonl> <state_abbrev>")
        sys.exit(1)
    targets_path = Path(sys.argv[1])
    state_abbrev = sys.argv[2]
    rows = [json.loads(l) for l in targets_path.read_text().splitlines() if l.strip()]

    out_path = WORKDIR / f"row-results-{state_abbrev}.jsonl"
    with out_path.open("w") as out_f:
        for i, row in enumerate(rows):
            t0 = time.time()
            res = process_row(row, state_abbrev)
            dt = time.time() - t0
            out_f.write(json.dumps(res) + "\n")
            out_f.flush()
            print(f"[{i+1}/{len(rows)}] {state_abbrev} {row['name'][:40]:40s} "
                  f"-> {res['verdict_pregate2']:8s} ({dt:.1f}s) {res.get('chosen_url') or res.get('drop_reason')}")
            time.sleep(SLEEP_BETWEEN_ROWS_S)


if __name__ == "__main__":
    main()
