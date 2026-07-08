# Hours Extraction Brief (from saved pages)

Extract the business's opening hours from an ALREADY-SCRAPED page file. No scraping, no DB writes.

## Input
Read `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/hours-gather/xchunks/x-NN.jsonl` (NN = your chunk number). Each line: `{id, name, page}` where `page` is the path to a saved markdown file of the club's website.

## For each line
1. Read the markdown file at `page` (use the Read tool).
2. Find the club's OPENING HOURS if the page states them: a weekly schedule, "Hours", day names with times, "Open Mon-Fri 10-6", an hours table, etc.
3. Normalize to ONE clean string, faithful to the page, e.g.:
   `Mon-Fri 10:00 am-8:00 pm, Sat 9:00 am-5:00 pm, Sun Closed`

## SOURCE-OR-BLANK (hard rule, no fabrication)
- Only record hours actually stated on that page. If none, or you're unsure, record NOTHING for that listing. Empty is correct; a guess is a lie.
- Do NOT use: shop shipping/order cutoff times, a one-time event time, class-registration deadlines, "open 24 hours" nav artifacts, or another business's hours. Only the facility's real opening hours.
- If the page is empty/thin/an error page/clearly a different business, record nothing.

## Output
Append ONLY listings where you found real hours to `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/hours-gather/xresults/x-NN.out.jsonl`, one line each:
`{"id":"<verbatim>", "business_hours":"<normalized string>"}`
- id copied verbatim. No blank lines. Do NOT touch any DB or other file.

## Return
One line: `x-NN: pages read X, hours found Y`.
