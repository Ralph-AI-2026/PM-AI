#!/usr/bin/env python3
import json, os, re, urllib.request, urllib.parse, ssl, sys

BASE = "/home/jrpkennedy/arc-audit/us-engine/runs/photos/california"
PROOF = os.path.join(BASE, "proof")
CAND = os.path.join(BASE, "candidates.jsonl")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept":"text/html,image/*,*/*"})
    return urllib.request.urlopen(req, timeout=timeout, context=ctx)

def get_html(url):
    try:
        r = fetch(url)
        data = r.read()
        return data.decode("utf-8", errors="replace"), r.geturl()
    except Exception as e:
        return None, str(e)

def find_image(html, base_url):
    # og:image
    for pat in [
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
        r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image["\']',
    ]:
        m = re.search(pat, html, re.I)
        if m:
            return urllib.parse.urljoin(base_url, m.group(1).strip()), "og:image/twitter"
    # first large img
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I)
    for src in imgs:
        if any(x in src.lower() for x in ["logo","icon","sprite",".svg",".gif","pixel","avatar","1x1"]):
            continue
        return urllib.parse.urljoin(base_url, src.strip()), "first-img"
    return None, None

def download(url, dest):
    try:
        r = fetch(url, timeout=25)
        data = r.read()
        if len(data) < 5000:
            return 0
        with open(dest, "wb") as f:
            f.write(data)
        return len(data)
    except Exception as e:
        print("  dl fail:", e, file=sys.stderr)
        return 0

targets = json.load(open(os.path.join(BASE, "targets.json")))
lines = []
results = {}
for t in targets:
    tid = t["id"]; name = t["name"]; web = t.get("website")
    entry = {"website_og": None}
    if not web:
        lines.append(json.dumps({"id":tid,"name":name,"source":"website_og","url":None,"file":None,"bytes":0}))
        results[tid] = entry
        print(f"[{name}] no website")
        continue
    html, final = get_html(web)
    if not html:
        lines.append(json.dumps({"id":tid,"name":name,"source":"website_og","url":None,"file":None,"bytes":0}))
        print(f"[{name}] html fetch failed: {final}")
        results[tid] = entry
        continue
    img_url, how = find_image(html, final)
    if not img_url:
        lines.append(json.dumps({"id":tid,"name":name,"source":"website_og","url":None,"file":None,"bytes":0}))
        print(f"[{name}] no image found in html")
        results[tid] = entry
        continue
    dest = os.path.join(PROOF, f"{tid[:8]}-A_website.jpg")
    n = download(img_url, dest)
    if n:
        lines.append(json.dumps({"id":tid,"name":name,"source":"website_og","url":img_url,"file":dest,"bytes":n}))
        print(f"[{name}] OK {how} {n}B -> {img_url}")
        entry["website_og"] = dest
    else:
        lines.append(json.dumps({"id":tid,"name":name,"source":"website_og","url":img_url,"file":None,"bytes":0}))
        print(f"[{name}] img download failed/too small: {img_url}")
    results[tid] = entry

with open(CAND, "a") as f:
    for l in lines:
        f.write(l + "\n")
print("\n=== website candidates written ===")
