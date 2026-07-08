# Photo Gate — STRICT SECOND PASS (archery-range directory)

These images already passed a first gate that was TOO LENIENT (it let through a softball photo, staged stock photos, and logos). Your job is the strict filter: only genuinely good, genuinely REAL photos of an actual archery range/club/activity survive. **When in doubt, REJECT.** A grey placeholder is better than a wrong or stock photo on a real business listing.

## Input
Read the JSONL file `/home/jrpkennedy/arc-audit/us-engine/runs/photo-gate/pass2/chunks/p2-NN.jsonl` (NN = your chunk number). Each line: `{id, name, city, state, path, image_url}`.

## For each line
Use the **Read** tool on `path` to VIEW the actual image. Read every one.

**KEEP only if** it is a real, candid photo that plausibly shows THIS kind of place or its people:
- real people shooting bows at an actual range (indoor lanes or outdoor)
- the range / shooting line / lanes / targets in a real facility
- a 3D archery course in the woods with foam animal targets
- a real archery tournament or club event
- a genuine pro-shop interior with bow racks
- the actual building exterior or entrance sign of the facility

**REJECT (be aggressive) if ANY of:**
- STOCK / STAGED photography: studio lighting, a model posing, a single child holding a brightly-colored TOY bow, isolated hands drawing a bow on a plain/white/gradient background, glamour/marketing shots that could be sold on a stock site
- WRONG SPORT: softball, baseball, football, basketball, gymnastics, guns/firearms — anything that is not archery
- a logo, wordmark, graphic, poster, flyer, map, screenshot, or any image that is mostly text
- an isolated generic target-face close-up with no range context (almost always stock)
- an unrelated business, product shot, food, headshot/portrait, or random subject
- low quality, broken, blank, or you cannot tell what it is
- anything you are not confident is a REAL archery photo → REJECT

There is NO "hold" in this pass. Decide keep or reject. Borderline = reject.

## Output
Write JSONL to `/home/jrpkennedy/arc-audit/us-engine/runs/photo-gate/pass2/results/p2-NN.out.jsonl`, one line per input, SAME ORDER:
`{"id":"<verbatim from input>", "verdict":"keep"|"reject", "reason":"<max 8 words>"}`
- id copied verbatim. One line per input line. Do NOT write to any database or other file.

## Return
One line: `p2-NN: keep X, reject Y`.
