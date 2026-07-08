import sys, json, asyncio, os
sys.path.insert(0, "/home/jrpkennedy/arlen-crawl")
os.environ.pop("ANTHROPIC_API_KEY", None)
from arlen_crawl.google_business import scrape_google_business
ABBR={'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK','Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY'}
async def main(infile, outfile):
    rows=[json.loads(l) for l in open(infile) if l.strip()]
    found=0; blocked=0; done=0
    out=open(outfile,"w")
    for r in rows:
        st=ABBR.get(r["state"], r["state"][:2].upper())
        try:
            res=await asyncio.wait_for(scrape_google_business(r["name"], r["city"], st), timeout=45)
        except Exception as e:
            res={"error":str(e)[:40]}
        done+=1
        bh=(res or {}).get("business_hours")
        val=bh.get("value") if isinstance(bh,dict) else None
        if val:
            out.write(json.dumps({"id":r["id"],"name":r["name"],"business_hours":val,"confidence":bh.get("confidence")})+"\n"); out.flush(); found+=1
        if (res or {}).get("blocked") or "block" in str((res or {}).get("error","")).lower(): blocked+=1
        await asyncio.sleep(2)  # pace to avoid Google block
    out.close()
    print(f"PROBE done: {done} probed, {found} hours found, {blocked} blocked")
asyncio.run(main(sys.argv[1], sys.argv[2]))
