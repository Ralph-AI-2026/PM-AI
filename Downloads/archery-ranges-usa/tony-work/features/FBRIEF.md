# Feature Extraction Brief (from saved club websites)

Extract archery-facility FEATURES from an already-scraped page. No scraping, no DB writes. SOURCE-OR-BLANK: only mark a feature TRUE when the page clearly states/shows it. Never mark anything false; if it's not clearly present, omit it.

## Input
Read `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/features/xchunks/f-NN.jsonl` (NN = your chunk number). Each line: `{id, name, page}` where `page` is a saved markdown file of that club's website.

## For each line
Read the markdown at `page`. Then decide each feature ONLY from what the page actually says:

- **has_pro_shop**: TRUE if the page clearly indicates an on-site pro shop / retail store / gear sales / "shop" selling bows & equipment. (A link to buy merch/apparel alone is NOT a pro shop.)
- **has_3d_course**: TRUE if it mentions an on-site 3D archery course/range (foam animal targets, "3D range", "3D course", "3D shoots" hosted there).
- **has_field_course**: TRUE if it mentions an on-site field archery course/round (marked/unmarked field course, "field range").
- **lessons_available**: TRUE if it offers lessons / classes / coaching / instruction / clinics / "learn to shoot".
- **equipment_rental_available**: TRUE if it offers equipment / bow rental (rent gear to shoot).

Rules:
- Only TRUE when the page genuinely supports it. If unclear or absent, OMIT that field entirely (do not write false).
- Do not infer from the club's NAME. Use the page content only.
- If the page is empty/thin/error/clearly a different business, write nothing for that listing.

## Output
Append to `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/features/results/f-NN.out.jsonl`, one line per listing that had AT LEAST ONE feature confirmed true:
`{"id":"<verbatim>", "has_pro_shop":true, "has_3d_course":true, "lessons_available":true}`  (include ONLY the keys you confirmed true; omit the rest)
- id copied verbatim. Skip listings where nothing was confirmed. Do NOT touch any DB or other file.

## Return
One line: `f-NN: pages read X | pro_shop Y, 3d A, field B, lessons C, rental D`.
