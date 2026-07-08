# Listing Description Writer (ARC US Directory)

Write a UNIQUE ~100-word description for each archery listing in your chunk. No database writes.

## Input
Read `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/descriptions/chunks/d-NN.jsonl` (NN = your chunk number). Each line is one listing with its REAL data:
`{id, name, facility_type, city, state, existing, pro_shop, course_3d, field_course, lessons, range_yards, lanes}`
- `existing` = the current thin one-line description; mine it for real facts (USA Archery / ASA affiliation, JOAD / 3D / adult programs) but do NOT copy its template phrasing.
- booleans (pro_shop, course_3d, etc.) are real features only when TRUE. `null`/false = unknown/absent, do not assert.

## Write each description (target 95-115 words)
Hard rules:
1. **UNIQUE every time.** Vary the opening line, sentence structure, and local angle for each listing. NEVER reuse a template like "X is a Y in Z." No two descriptions should read the same.
2. **Only real facts.** Use ONLY what's in that listing's data: its name, city/state, facility_type (commercial range / volunteer club / club / hybrid), any affiliation or program in `existing`, and features that are explicitly TRUE. NO FABRICATION, invent nothing (no made-up hours, prices, lane counts, amenities, history).
3. **Thin listings (just name + city, no programs/features):** write an honest, locally-specific description anchored on the real city/region and the kind of place it is (e.g. a community bow club, a commercial range), note the local archery/bowhunting context truthfully, and point readers to "contact the club/range directly" for specifics. Still make it unique. Do not pad with invented detail.
4. Natural, genuinely useful prose for an archer deciding where to shoot. American spelling. No emojis, no headings, no markdown, no bullet lists, one flowing paragraph.

Style reference (tiers): JOAD/affiliated clubs -> lead with the program pathway; ASA 3D clubs -> the 3D format + bowhunting angle; commercial ranges -> walk-in/beginner-friendly on-ramp; thin -> city/region + type + "contact directly." (See the shipped pilot for tone.)

## Output
Write `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/descriptions/results/d-NN.out.jsonl`, one line per listing, SAME ORDER:
`{"id":"<verbatim>", "description":"<~100-word unique paragraph>"}`
- id copied verbatim. One line per input line. Do NOT touch any DB or other file.

## Return
One line: `d-NN: wrote X descriptions`.
