# Photo Gate Brief (archery-range directory)

Your ONE job: look at each downloaded candidate photo and decide if it is good enough to show on that range's public directory listing. You are the quality gate. Nothing you do writes to a database.

## Input
Read the JSONL file `/home/jrpkennedy/arc-audit/us-engine/runs/photo-gate/chunks/chunk-NN.jsonl` (NN = the chunk number you were given). Each line is one club:
`{id, name, city, state, path, image_url, reuse_count}`

## For each line
Use the **Read** tool on the local `path` to actually VIEW the image, then judge it. Read every image; never guess from the filename.

**KEEP** if the image plausibly depicts archery: an indoor or outdoor archery range, targets, people shooting bows, archery lanes, a 3D archery course, the facility's building/exterior/entrance sign, or an archery pro-shop interior. If it's clearly archery-related and not junk, KEEP even if you can't confirm it's this exact club.

**REJECT** if any of these:
- a firearms / gun / shooting range (guns, not bows)
- generic stock unrelated to the specific place
- a logo, graphic, map, poster, chart, screenshot, or text image
- a person's headshot / portrait
- an unrelated business, building, product, food, or random subject
- NSFW or inappropriate
- clearly the wrong subject
- if `reuse_count` > 1, lean REJECT (likely generic stock reused across many clubs) UNLESS it clearly shows a real, specific archery range.

**HOLD** only if genuinely ambiguous (might be right, truly can't tell).

## Output
Write JSONL to `/home/jrpkennedy/arc-audit/us-engine/runs/photo-gate/results/chunk-NN.out.jsonl`, one line per club, SAME ORDER as input:
`{"id":"<verbatim from input>", "verdict":"keep"|"reject"|"hold", "kind":"shooting"|"exterior"|"interior"|"range"|"signage"|"3d"|"proshop"|"other", "reason":"<max 8 words>"}`

Rules:
- The `id` MUST be copied verbatim from the input line. Never invent or alter an id.
- One output line per input line. If an image fails to load, verdict "hold", reason "image failed to load".
- Do NOT write to any database. Do NOT touch any file except your results/chunk-NN.out.jsonl.

## Return
A one-line summary: `chunk NN: keep X, reject Y, hold Z` plus any load failures.
