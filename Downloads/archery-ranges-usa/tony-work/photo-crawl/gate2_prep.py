#!/usr/bin/env python3
"""gate2_prep.py -- combine TX+OH results, reuse-check, download candidates for visual review."""
import json
import os
import time
import urllib.request
from pathlib import Path

WORKDIR = Path(__file__).parent.resolve()
IMG_DIR = WORKDIR / "gate2-img"
IMG_DIR.mkdir(exist_ok=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

rows = []
for state in ("TX", "OH"):
    p = WORKDIR / f"row-results-{state}.jsonl"
    if not p.exists():
        continue
    for line in p.read_text().splitlines():
        if line.strip():
            rows.append(json.loads(line))

kept = [r for r in rows if r["verdict_pregate2"] == "kept"]

# Reuse check across ranges
url_count = {}
for r in kept:
    url_count[r["chosen_url"]] = url_count.get(r["chosen_url"], 0) + 1

manifest = []
for i, r in enumerate(kept):
    url = r["chosen_url"]
    reuse = url_count[url]
    fname = f"{r['state']}-{i:02d}-{r['id'][:8]}.img"
    path = IMG_DIR / fname
    dl_ok, dl_err = False, None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*,*/*"})
        with urllib.request.urlopen(req, timeout=15) as resp, open(path, "wb") as f:
            f.write(resp.read(5 * 1024 * 1024))  # cap 5MB
        dl_ok = path.stat().st_size > 0
    except Exception as e:
        dl_err = str(e)[:150]
    manifest.append({
        "id": r["id"], "name": r["name"], "city": r.get("city"), "state": r["state"],
        "image_url": url, "source_page": r["chosen_source_page"],
        "reuse_count": reuse, "local_path": str(path) if dl_ok else None,
        "dl_error": dl_err,
    })
    print(f"[{i+1}/{len(kept)}] {r['name'][:35]:35s} dl={'ok' if dl_ok else 'FAIL'} reuse={reuse}")
    time.sleep(0.5)

with open(WORKDIR / "gate2-manifest.jsonl", "w") as f:
    for m in manifest:
        f.write(json.dumps(m) + "\n")
print("manifest:", len(manifest), "dl_ok:", sum(1 for m in manifest if m["local_path"]))
