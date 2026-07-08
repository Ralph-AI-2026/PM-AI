# Business-Hours Gather Brief (Arlen + crawl4ai, US directory)

Your job: for each US archery listing in your chunk, scrape its OWN website with Arlen (crawl4ai) and extract the business's opening hours, SOURCE-OR-BLANK. No database writes.

## Input
Read `/home/jrpkennedy/arc-audit/us-engine/runs/hours-gather/chunks/h-NN.jsonl` (NN = your chunk number). Each line: `{id, name, website}`.

## For each line
1. Scrape the site with Arlen (renders JS via crawl4ai, NO LLM, credit-free):
   `/home/jrpkennedy/arlen-crawl/.venv/bin/arlen-crawl scrape -q -t 30000 "<website>"`
   Capture the markdown output. If it errors/times out/empty, record nothing for that listing (blank) and move on. Do a couple retries max, don't hang.
2. Read the markdown and find the business's OPENING HOURS if present (look for a schedule: day names + times, "Hours", "Open", "Mon-Fri 9am-6pm", a weekly table, etc.).
3. Normalize to ONE clean string, e.g. `Mon-Fri 9:00 am-6:00 pm, Sat 9:00 am-2:00 pm, Sun Closed`. Keep it faithful to what the page says.

## SOURCE-OR-BLANK (hard rule, no fabrication)
- Only record hours you actually SAW verbatim/clearly stated on that page. If the page has no hours, or you are unsure, leave it BLANK (record nothing). An empty field is correct; a guessed one is a lie.
- Do NOT use a shop's product/shipping hours, an event's one-time time, or a generic "24/7" nav artifact as the business hours. Only the facility's real opening hours.
- If the scraped site clearly isn't this club (wrong business), skip it.

## Output
Append ONLY the listings where you found real hours to `/home/jrpkennedy/arc-audit/us-engine/runs/hours-gather/results/h-NN.out.jsonl`, one line each:
`{"id":"<verbatim>", "business_hours":"<normalized string>", "source":"<the website url you scraped>"}`
- id copied verbatim from input. Do NOT write blanks. Do NOT touch any DB or other file.

## Return
One line: `h-NN: scraped X sites, hours found Y, no-hours Z, errors E`.
