#!/usr/bin/env python3
# Usage: save_gmaps.py <id> <name> <encoded_url_or_NONE>
import sys, os, json, urllib.request, ssl, re

BASE = "/home/jrpkennedy/arc-audit/us-engine/runs/photos/california"
PROOF = os.path.join(BASE, "proof")
CAND = os.path.join(BASE, "candidates.jsonl")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE

def decode(enc):
    return (enc.replace('~S~','https').replace('~C~',':').replace('~D~','.')
               .replace('~E~','=').replace('~Q~','?').replace('~N~','&'))

def upsize(url):
    # bump google place photo size params for higher res
    url = re.sub(r'=w\d+-h\d+', '=w1200-h900', url)
    return url

tid, name, enc = sys.argv[1], sys.argv[2], sys.argv[3]
line = {"id":tid,"name":name,"source":"gmaps","url":None,"file":None,"bytes":0}
def try_dl(u):
    req = urllib.request.Request(u, headers={"User-Agent":UA})
    return urllib.request.urlopen(req, timeout=25, context=ctx).read()

if enc and enc != "NONE":
    orig = decode(enc)
    big = upsize(orig)
    dest = os.path.join(PROOF, f"{tid[:8]}-B_gmaps.jpg")
    data=None; used=None
    for u in ([big, orig] if big!=orig else [orig]):
        try:
            d = try_dl(u)
            if len(d) >= 5000:
                data=d; used=u; break
            else:
                print(f"[{name}] too small ({len(d)}B) {u}")
        except Exception as e:
            print(f"[{name}] dl fail ({e}) {u}")
    if data:
        open(dest,"wb").write(data)
        line["url"]=used; line["file"]=dest; line["bytes"]=len(data)
        print(f"[{name}] gmaps OK {len(data)}B -> {used}")
    else:
        line["url"]=orig
        print(f"[{name}] gmaps: all downloads failed")
else:
    print(f"[{name}] gmaps: no url")
open(CAND,"a").write(json.dumps(line)+"\n")
