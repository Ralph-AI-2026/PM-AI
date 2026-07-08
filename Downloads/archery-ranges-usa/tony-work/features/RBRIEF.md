# Remaining-Categories Extraction Brief (from saved club websites)

Extract the remaining facility details from an already-scraped page. No scraping, no DB writes. SOURCE-OR-BLANK: only record a value the page actually states. Omit anything not clearly present. Never guess prices, counts, or amenities.

## Input
Read `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/features/xchunks/f-NN.jsonl` (NN = your chunk number). Each line: `{id, name, page}`.

## For each line
Read the markdown at `page`, then record ONLY the fields the page clearly states:

- **number_of_lanes** (text): e.g. "20" if the page says it has 20 lanes/bays. Only an explicit count.
- **range_length_yards** (text): the shooting distance in YARDS if stated (e.g. "20" for a 20-yard indoor range; convert an explicit meters value only if simple, else record as stated). Only if the page gives a distance.
- **membership_required** (bool true): TRUE only if the page says you MUST be a member to shoot (members-only / membership required). If it's open to the public or offers drop-in, do NOT set this.
- **membership_price_adult** (text): the adult membership price/dues verbatim if stated (e.g. "$150/year", "$40 annual").
- **drop_in_price** (text): the walk-in / range / lane fee verbatim if stated (e.g. "$15/hour", "$12 range fee").
- **lesson_price_range** (text): lesson/class pricing verbatim if stated (e.g. "$40/session", "$120 for 6-week course").
- **bow_types_allowed** (text): only if the page specifies which bow types are allowed/restricted (e.g. "recurve and compound", "no crossbows", "traditional only").
- **accessibility** (text): only if the page states an accessibility detail (e.g. "wheelchair accessible", "ADA accessible range").
- **parking_available** (bool true): TRUE only if the page clearly states parking is available (e.g. "free parking", "ample parking on site").

Rules:
- SOURCE-OR-BLANK. Record a field ONLY when the page genuinely states it. Omit everything else. Never invent a price, count, or amenity. Do NOT infer from the club's name or from generic assumptions.
- If the page is empty/thin/error/a different business, record nothing for that listing.

## Output
Append to `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/features/rresults/r-NN.out.jsonl`, one line per listing that had AT LEAST ONE field found:
`{"id":"<verbatim>", "drop_in_price":"$15/hour", "number_of_lanes":"20"}`  (include ONLY the keys you confirmed; omit the rest)
- id copied verbatim. Skip listings with nothing found. Do NOT touch any DB or other file.

## Return
One line: `r-NN: pages X | lanes A, range B, memb_req C, memb_price D, dropin E, lesson_price F, bowtypes G, access H, parking I`.
