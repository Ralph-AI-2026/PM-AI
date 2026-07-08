# Facebook Page Extraction Brief (US archery clubs)

Extract facility info from a saved Facebook page text dump. No scraping, no DB writes. SOURCE-OR-BLANK: record a field ONLY when the page text clearly supports it. Omit anything not clearly present. Never guess.

## Input
Read `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/fb-gather/xchunks/fb-NN.jsonl` (NN = your chunk number). Each line: `{id, name, page}` where `page` is a saved .txt of the club's Facebook page.

## First, IGNORE Facebook nav chrome
These lines are Facebook UI, NOT club data, ignore them entirely: "Unread Chats", "Number of unread notifications", "New notification in settings", "Message", "Follow", "Call now", "Search", "likes", "followers", "following", "All / About / Photos / Followers / Mentions / More", "Intro", "Category", "Details", "Contact info", "Privacy and legal info", "Bio".

## Skip non-archery
If the FB Category line clearly says the place is a Gun Range / Rifle Range / Shooting Range (firearms) / Sportsman's Club with NO archery mention, SKIP that listing (write nothing).

## For each line, from the real club text extract ONLY what's stated:
- **business_hours**: opening hours if a schedule is shown (day+times).
- **phone_number**: a phone number shown on the page (e.g. "+1 440-453-0494" -> normalize to (440) 453-0494 or keep as shown).
- **has_pro_shop** (true): if it's an "Archery Shop", sells gear, does repairs / bow setups / pro shop.
- **has_3d_course** (true): mentions 3D archery / 3D range / 3D shoots.
- **has_field_course** (true): mentions field archery / field course.
- **lessons_available** (true): mentions lessons / classes / coaching / instruction / "learn to shoot" / a coach.
- **equipment_rental_available** (true): mentions equipment/bow rental.
- **number_of_lanes** (text), **range_length_yards** (text), **membership_price_adult** (text), **drop_in_price** (text), **lesson_price_range** (text), **bow_types_allowed** (text), **accessibility** (text), **parking_available** (true): only if explicitly stated.

Rules: only include keys you confirmed from the text. Omit the rest (do not write false/blank). Booleans: include only when true.

## Output
Append to `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/fb-gather/results/fb-NN.out.jsonl`, one line per listing that had AT LEAST ONE field:
`{"id":"<verbatim>", "lessons_available":true, "has_pro_shop":true, "phone_number":"(440) 453-0494"}`
- id copied verbatim. Skip listings with nothing / skipped ones. Do NOT touch any DB or other file.

## Return
One line: `fb-NN: pages X | hours A, phone B, proshop C, 3d D, field E, lessons F, rental G, other H, skipped-nonarchery S`.
