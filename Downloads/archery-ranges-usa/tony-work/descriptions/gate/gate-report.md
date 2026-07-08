# Description Gate Report — US Directory Listing Descriptions

Run date: 2026-07-06. Spot-check sampling seed: 20260706. STAGE ONLY — nothing in
this run touched the database. No description text was rewritten, improved, or
paraphrased by the gate; the gate only drops (with reason), flags (for human
review, row stays kept), normalizes whitespace, and SQL-escapes.

**Top-line: no untraceable specific facility fact was found in the spot check.**
All lane counts, pro-shop/lessons/3D-course/field-course claims, facility types,
and affiliation/program mentions in the 5 sampled rows trace verbatim to a real
source field. See the residual note on general regional color at the bottom —
it is not a violation of the no-fabrication rule but is worth Josh's awareness.

## A. Gate results

| Metric | Count |
|---|---|
| Input lines (across 42 result files) | 1,667 |
| Kept (passed all DROP checks) | 1,667 |
| Dropped (total) | 0 |
| Flagged rows (at least one flag; still kept) | 29 |

Dropped by reason: none triggered. `malformed-json`, `missing-id`,
`missing-description`, `unknown-id/fabricated`, `duplicate-id`: all 0.
(Cross-checked directly: 1,667 result-file lines, 1,667 unique ids, all 1,667
found verbatim in the export CSV's `id` column, 0 duplicates — see Section E.)

Flagged by reason (a row can carry more than one flag; counts are per-flag,
not per-row):

| Reason | Count |
|---|---|
| superlative-claim | 28 |
| day-of-week-hours-phrasing | 1 |
| dollar-amount | 0 |
| clock-time | 0 |
| phone-number | 0 |
| lane-count-mismatch | 0 |
| em-dash | 0 |
| length-out-of-range | 0 |

All 1,667 descriptions landed inside the 200–1200 char sanity window (actual
range: 558–874 chars, average 710), so no length flags fired.

### Flagged entries in full (29 rows)

**superlative-claim (28)** — every single hit is the token "largest" (or
"second-largest") used as a **city/metro-area size fact**, e.g. "Charlotte's
status as one of North Carolina's largest metro areas," "Fresno, the largest
city in California's Central Valley," "Anchorage, Alaska's largest city."
These are true, independently-verifiable public facts about the *city*, not
unverifiable claims about the *archery facility* (no listing claims to be
"the largest archery range" or "award-winning"). Read as a batch, they are low
risk, but they were written by the gate spec (flag "largest") so they're
listed here rather than silently passed:

| id | snippet |
|---|---|
| b62a4680-d961-43dc-8844-9a4ccfc4872c | "...rth Carolina's largest metro areas gi..." |
| f95e0094-e5fb-49be-bb21-3ad37f776d2e | "...tern Wyoming's largest city a dedicat..." |
| ff804b31-4f57-479f-b421-21ed92d8c047 | "...ze as Kansas's largest city supports..." |
| fd4cd258-0160-40b0-8ad4-1e4628b618b5 | "...mbus is Ohio's largest city, and a bi..." |
| 0ffadd98-0d6a-43b1-8069-782ef40c9d6f | "...in the state's largest city. Faciliti..." |
| b0de9a64-709d-4fdf-af6e-3009bdaaba8d | "...Texas's second-largest city. The name..." |
| da356d5f-5ebf-48ec-91b6-82ca38c3af76 | "...as Nebraska's largest city supports..." |
| cc263737-423b-4833-82c8-93a6d80e48f1 | "...has one of the largest bowhunting pop..." |
| af1906ab-cf02-4c85-9cea-1c9b10f092db | "...s New Mexico's largest city, Albuquer..." |
| f07581d3-511e-4a38-9554-e875bc6352f7 | "...in, one of the largest freshwater cat..." |
| 7bcdcf2c-267f-412f-bd0a-545f3fe3ad06 | "...in Fresno, the largest city in Califo..." |
| 632a0fc7-bc14-4ed4-8a19-0e192f236ad5 | "...diana's second-largest city and home..." |
| bc0f63cb-a294-47e6-8ab8-0a4c410eb1cd | "...the country's largest bowhunting pop..." |
| 1ea33692-2b2c-48c7-8db6-845377b27632 | "...and is Maine's largest city and the h..." |
| 99e88232-2bcf-424e-8a37-d86aef6fbffc | "...ounty seat and largest city within Ma..." |
| 9f4ecaee-5d0f-4146-ba7f-0ad747913890 | "...South Dakota's largest metro area. Th..." |
| f553c458-c92d-45dc-b1ca-f720bc9faddb | "...Mississippi's largest metro area. Gi..." |
| e60e5fa3-2a46-4f2a-946a-687693e45a27 | "...the country's largest urban parks st..." |
| 03492124-f98c-4af0-8d73-4324fa2a22af | "...in the state's largest city likely dr..." |
| b5d45444-0e43-4966-b85f-8b21522cd100 | "...astern Idaho's largest city outside t..." |
| ded5ea2b-f7ad-439f-9cef-acd6cde64c72 | "...state's second-largest city. Rapid Ci..." |
| 22136ea6-050f-48f8-a014-30e6c00c1a2c | "...state's second-largest city, and havi..." |
| fb37dba8-411c-427b-be19-af12385aaf0c | "...rage, Alaska's largest city, and its..." |
| 2af1328e-affc-4587-a975-070152f3cb1b | "...Michigan's two largest metro areas gi..." |
| d5ad035b-0d8e-427b-9814-86017b41befb | "...a, the state's largest city along the..." |
| b17a4d78-7f34-4193-9d5f-ad0173c57b38 | "...in one of the largest and fastest-gr..." |
| 760b73df-ba4a-4868-9216-da50221c769e | "...es, one of the largest retirement com..." |
| 36d741e2-41c4-4f54-85a4-a08558d5cded | "...erves Kansas's largest city as a volu..." |

**day-of-week-hours-phrasing (1)**:

| id | snippet | full context |
|---|---|---|
| 2c8b3337-ee6c-4ea1-9682-ef7f70b62869 | "...ups, or a busy Saturday without everyone waiting on t..." | Full sentence: "Fifteen lanes is a solid number for a commercial operation, meaning there's real room for leagues, groups, or a busy Saturday without everyone waiting on the line." This is a hypothetical scenario about lane capacity, not an asserted operating-hours/schedule claim (no specific hours, no "open Saturday 9-5" style statement). The listing (Broken Arrow Archery Inc) does have a real `lanes: 15` in both the chunk and export CSV, which the description correctly cites — no fabrication, false positive on the day-word trigger. |

## B. THIN vs RICH split

Scope tagged from the export CSV's **current** `description` column (not the
generated one): THIN = current description is empty/null OR matches
`^Archery range located in`. RICH = anything else.

| Scope | Kept count |
|---|---|
| THIN | 953 |
| RICH | 714 |
| **Total** | **1,667** |

(Underlying export CSV breakdown: 31 null/empty + 922 boilerplate "Archery
range located in..." = 953 THIN; 714 rows had some other existing description,
e.g. "ASA-affiliated 3D archery club. Contact: ..." or "IBO pro shop (IBO
directory)." = RICH.)

Josh owns the decision on which set(s) to apply and when — this run stages
both, unmerged, so either can be approved independently.

## C. Spot-check trace table (5 rows, seed 20260706)

Claims traced against the row's real source chunk (`../chunks/d-NN.jsonl`)
and the export CSV. "Source field" cites the chunk field unless noted.

| # | id / listing | Claim in description | Source field | Verdict |
|---|---|---|---|---|
| 1 | 5f0822cd-1039-4198-9e7b-ab98506a79a6 (Archery Central LLC, Idaho) | "commercial operation" | `facility_type: commercial` | Traceable |
| | | "pairs a pro shop with lessons" | `pro_shop: true`, `lessons: true` (CSV: has_pro_shop=True, lessons_available=True) | Traceable |
| | | "no 3D course... confirmed" | `course_3d: false` (correctly stated as absent, not asserted as a feature) | Traceable |
| | | "exact city isn't specified" | `city: null` | Traceable (honest gap, per DBRIEF rule 3) |
| 2 | cc282baa-010a-465b-ae6f-0cf50277675a (Tripp County Range Robins, Colome SD) | "club rather than a commercial operation" | `facility_type: club` | Traceable |
| | | "Colome, South Dakota" | `city: Colome`, `state: South Dakota` | Traceable |
| | | no feature claims made (pro_shop/lessons/3D all false in chunk, description asserts none) | n/a | Traceable — correctly silent |
| 3 | b09fa655-c2a4-4676-b8a3-cec33b20c261 (Copendero Indoor Archery, Pistol & Rifle Range, Conroe TX) | "combines archery with firearms shooting under one indoor roof" | `name` field itself ("...Archery, Pistol & Rifle Range") — not a separate boolean, but a verbatim read of the real listing name | Traceable to `name` |
| | | "commercial facility" | `facility_type: commercial` | Traceable |
| | | "Conroe, north of Houston" | `city: Conroe`, `state: Texas` | Traceable (Houston reference is real public geography, city is 40mi N of Houston) |
| | | "lane counts... aren't published" | `lanes: null` | Traceable (honest gap) |
| 4 | 87c5f69b-5d08-498e-afcb-c3519f94d9ca (Columbia Basin Archers, Ephrata WA) | "volunteer-run club" | `facility_type: volunteer_club` | Traceable |
| | | "Ephrata... central Washington's Columbia Basin... Grant County" | `city: Ephrata`, `state: Washington` for the city/state; "Columbia Basin" / "Grant County" are real public geography (Ephrata is the Grant County seat) but **not present as a field in the chunk** | Independently true, but not sourced from provided chunk data — see Residual note below |
| | | "course type, hours, membership... not currently available" | all feature booleans false/null in chunk | Traceable (honest gap) |
| 5 | fc847f7b-156c-4f00-8786-c3858bccfeb8 (The Quiver, Bentonville AR) | "USA Archery-affiliated hybrid facility" | `facility_type: hybrid`; `existing: "USA Archery affiliated club..."` | Traceable, verbatim from `existing` |
| | | "JOAD program" + "Adult Archery Program" | `existing: "...Programs: Junior Olympic Archery Development (JOAD), Adult Archery Program"` | Traceable, verbatim from `existing` |
| | | "Bentonville has grown fast... Northwest Arkansas region" | real public fact, not in chunk fields | Independently true, not chunk-sourced — see Residual note below |

**Verdict: all specific facility-feature claims (facility type, pro shop, lessons,
3D/field course, lane counts, affiliations/programs) traced cleanly to a real
source field in all 5 sampled rows. No fabricated facility fact found.** Two
rows (#3, #4, #5) include general regional/geographic color that is true but
not literally present in the chunk data — flagged as a residual, not a gate
failure (see Section E).

## D. Artifact paths

All paths under `/mnt/c/Users/jrpke/Downloads/archery-ranges-usa/tony-work/descriptions/gate/`:

- `gate_descriptions.py` — the gate script (read-only against inputs, writes only into this `gate/` dir)
- `gate-report.md` — this report
- `gate-summary.json` — machine-readable counts (mirrors Sections A/B/E)
- `kept-thin.jsonl` — 953 lines, `{id, description}`
- `kept-rich.jsonl` — 714 lines, `{id, description}`
- `flagged-entries.json` — full detail for all 29 flagged rows
- `dropped-entries.json` — empty array (0 drops this run)
- `spot-check-sample.json` — raw dump of the 5 sampled rows (description + chunk + csv_row) used to build Section C by hand

SQL (THIN, 10 files, 953 tuples total):

| File | Tuples |
|---|---|
| desc-thin-batch-01.sql | 100 |
| desc-thin-batch-02.sql | 100 |
| desc-thin-batch-03.sql | 100 |
| desc-thin-batch-04.sql | 100 |
| desc-thin-batch-05.sql | 100 |
| desc-thin-batch-06.sql | 100 |
| desc-thin-batch-07.sql | 100 |
| desc-thin-batch-08.sql | 100 |
| desc-thin-batch-09.sql | 100 |
| desc-thin-batch-10.sql | 53 |
| **Total** | **953** |

SQL (RICH, 8 files, 714 tuples total):

| File | Tuples |
|---|---|
| desc-rich-batch-01.sql | 100 |
| desc-rich-batch-02.sql | 100 |
| desc-rich-batch-03.sql | 100 |
| desc-rich-batch-04.sql | 100 |
| desc-rich-batch-05.sql | 100 |
| desc-rich-batch-06.sql | 100 |
| desc-rich-batch-07.sql | 100 |
| desc-rich-batch-08.sql | 14 |
| **Total** | **714** |

Each `.sql` file is a single `UPDATE public.ranges AS r SET description = v.description
FROM (VALUES (...)) AS v(id, description) WHERE r.id = v.id::uuid AND
r.is_claimed = false;` — matching the photo-gate house style (`apply/batch-NN.sql`),
except it sets `description` only and does **not** bump `updated_at`, per hard
rule 4 ("setting description and nothing else"). Every tuple is guarded by
`is_claimed = false` per hard rule 4, even though no US row in this export is
claimed (verified: 1,667/1,667 `is_claimed = False` in the CSV) — the guard
still belongs in every statement per the standing defense-in-depth rule.

## E. Arithmetic verification

```
input result lines (wc -l d-01..d-42.out.jsonl):      1,667
unique ids in results:                                 1,667  (0 duplicates)
ids verified present in export CSV id column:          1,667  (0 missing/unknown)
export CSV row count:                                  1,667

kept = input - dropped = 1,667 - 0 =                   1,667
kept_thin + kept_rich = 953 + 714 =                     1,667  == kept  ✓

thin SQL tuples:  9*100 + 53 = 953   == kept_thin  ✓
rich SQL tuples:  7*100 + 14 = 714   == kept_rich  ✓
thin+rich SQL tuples: 953 + 714 = 1,667 == kept == input  ✓
```

`gate-summary.json` records `thin_tuple_total_matches: true` and
`rich_tuple_total_matches: true`, computed directly from re-counting the
tuples written to each `.sql` file (not just recomputing the same in-memory
list length), so this isn't a tautology — it's a real regenerate-and-recount
check.

## Residuals

1. **General regional/geographic color not traceable to chunk fields.**
   Several descriptions (see spot-check rows #3, #4, #5, and the "largest
   city/metro" superlative flags) include true, independently-verifiable
   public facts about a city or region (population rank, proximity to a
   larger city, regional climate/economy) that are not present as a field in
   the source chunk (`{id, name, facility_type, city, state, existing,
   pro_shop, course_3d, field_course, lessons, range_yards, lanes}`). This is
   not a violation of the hard no-fabrication rule as applied to the
   *facility* (no invented hours/prices/amenities/lane counts were found),
   but it is general-knowledge scene-setting the gate cannot verify against
   the provided data. The DBRIEF explicitly permitted "note the local
   archery/bowhunting context truthfully," so this was in scope for the
   writer — flagging it here so Josh can decide if that latitude is still
   wanted, or if a future pass should restrict descriptions to pure chunk-field
   facts only.
2. **Superlative-claim heuristic over-fires on city-size language.** All 28
   superlative flags are "largest/second-largest city/metro" references, none
   are actual unverifiable claims about the *archery facility* ("award-winning
   range," etc. — zero hits on those three tokens). The heuristic did its job
   (flag, don't drop) but a smarter version would distinguish "largest CITY"
   from "largest RANGE." Left as-is per the exact spec; noting it so it isn't
   mistaken for 28 fabrication incidents.
3. **Lane-count and day-of-week-hours checks had very little surface to test.**
   Only 69/1,667 export rows have any `number_of_lanes` value at all, and the
   one description that mentions a specific lane count in the spot pool
   (Broken Arrow Archery Inc, "15-lane") matched its CSV value exactly — so
   the mismatch path is implemented and tested logically (verified 0 chunk-vs-CSV
   discrepancies across all 69 non-null lane rows before the gate even ran)
   but has a thin real-world sample of confirmed-correct cases in this
   dataset. Zero dollar/clock-time/phone-number flags fired at all — either
   genuinely clean output, or these fabrication modes simply don't occur in
   this writer's style; can't distinguish from a stage-only gate.
4. **THIN/RICH is Josh's call, not encoded here.** The gate produces two
   independent, separately-appliable SQL sets. It does not recommend applying
   one before the other, together, or on any timeline — that's the scope
   decision the task explicitly reserved for Josh.
5. **Two rows contain embedded double quotes (9 descriptions total have `"`,
   confirmed by pre-scan) and 1,474 contain apostrophes/single quotes** (e.g.
   "archer's," "don't"). All single quotes are escaped via doubling in the SQL
   output per hard rule 5e; double quotes are left as literal characters since
   they cannot break a single-quoted Postgres string literal — no drops or
   rewrites were needed for either case.
