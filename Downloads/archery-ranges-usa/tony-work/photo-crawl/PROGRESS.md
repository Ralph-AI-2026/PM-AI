# Own-Site Photo Crawl — TX/OH Pilot (2026-07-06)

STAGE ONLY. No DB writes. Josh-approved option A: photos from the range's OWN
website/Facebook via crawl4ai (arlen-crawl), never image search.

## Pipeline
1. targets: anon REST query, active+unclaimed, post_images LIKE %unsplash%, has website OR facebook_url
2. acquire: crawl_pilot.py — arlen-crawl scrape -f html per row, sequential, 2s sleep
3. extract: og:image > twitter:image > first 15 <img> srcs (regex on fetched HTML)
4. gate v1 (in-crawl): filename junk (logo/icon/svg/gif), platform defaults,
   HEAD 200 image/* + content-length >= 15KB (falls back to GET when HEAD refused)
5. gate v2 (post-crawl): cross-range reuse check, FB profile-pic squares review, final keeps
6. stage: keeps.jsonl + apply/batch-NN.sql (guarded: is_claimed=false AND post_images LIKE '%unsplash%')

## Status
- [x] Work dir created
- [x] Targets pulled: TX raw 73 unsplash rows -> 50 with website/fb; OH raw 48 -> 35
  (note: DB column is `status='active'` not is_active; city via cities join)
- [x] Smoke test 3 TX rows: 2 kept, 1 dead-site skip (worked)
- [x] TX crawl complete: 50 attempted -> 29 chosen pre-gate2, 21 dropped
      drops: 11 unreachable (Patchright timeout), 5 all-candidates-failed-gate,
             2 no img tags, 3 dead/parked
- [x] OH crawl complete: 35 attempted -> 28 chosen pre-gate2, 7 dropped
- [x] Gate v2 VISUAL review: all 57 candidates downloaded (gate2-img/) and viewed
      (2 sonnet chunks; Tony spot-audited 4 keeps, confirmed accuracy, demoted the
      Wylie karate-class photo to holds) -> 15 keeps -> 14 final after reuse check
- [x] Stage SQL -> apply/stable-batch-01.sql (6 rows) + apply/fbcdn-batch-01.sql
      (8 rows, DO NOT APPLY until rehosted: fbcdn oe= signed URLs expire in weeks;
      local copies already saved in gate2-img/ so rehost needs no re-crawl)
- [x] FINAL FUNNEL: 121 unsplash rows (TX 73 + OH 48) -> 85 targets with a source
      -> 73 reachable -> 66 with candidates -> 57 gate-v1 -> 14 kept / 43 held.
      Yield 16.5% of attempts (11.6% of all unsplash rows) — BELOW the 25% bar.
      Report delivered in the pilot agent's final message (protocol: no report file).

## APPLY PHASE (coordinator-authorized, 2026-07-06, same session)
- [x] US project had NO storage buckets; created public bucket `range-photos`
      (note: CA convention is `range-images` — name divergence flagged to Tony)
- [x] 14 keeps converted to JPEG (max 1600px, q88) in upload/, named <range-id>.jpg
- [x] Uploaded via storage REST API using a TEMPORARY anon INSERT policy
      (temp_anon_upload_range_photos_20260706), policy DROPPED after upload.
      14/14 uploaded, 14/14 public URLs verified 200 image/jpeg.
- [x] APPLIED apply/storage-apply.sql via Supabase MCP execute_sql:
      UPDATE ... WHERE is_claimed=false AND post_images LIKE '%unsplash%'
      RETURNING confirmed exactly 14 rows (all names matched keeps.jsonl).
- [x] LIVE VERIFIED: /texas/austin/austin-archery-club-tx and
      /ohio/doylestown/silver-creek-metro-park-archery-range-oh on
      archeryrangesusa.com both render the range-photos storage URL in HTML.
      (Range page URL pattern is /<state>/<city>/<slug>.)
- Holds untouched: holds.jsonl (43 rows) awaiting Josh's eyeball.
- SUPERSEDED: apply/stable-batch-01.sql + apply/fbcdn-batch-01.sql (hotlink/fbcdn
  versions) — do NOT run; storage-apply.sql is what went live.

## Notes / gotchas
- FB og:image works when the page renders (Blackriverarchery test OK) BUT the
  og:image on FB pages is the PROFILE PICTURE (often a logo) — flag for gate v2.
- FB CDN URLs are signed with expiry (&oe=...) — they WILL go stale. Flagged as a
  systemic issue for the report: FB-sourced URLs are not durable hotlink targets.
- Some keeps are clearly logos hosted as png (Team SPIDERx wixstatic, Legacy Archery
  LA-Black-Green.png) — gate v2 must catch these.
