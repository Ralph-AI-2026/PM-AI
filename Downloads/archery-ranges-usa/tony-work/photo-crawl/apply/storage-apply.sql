-- photo-crawl pilot: 14 keeps rehosted to range-photos bucket, applied 2026-07-06
UPDATE public.ranges AS r SET post_images = v.img, updated_at = now()
FROM (VALUES
  ('09bb7ade-1233-4ea2-bc62-16804d2a28e5'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/09bb7ade-1233-4ea2-bc62-16804d2a28e5.jpg"]'),
  ('9fcff797-0707-4cf8-b605-6b589ddfdade'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/9fcff797-0707-4cf8-b605-6b589ddfdade.jpg"]'),
  ('1afdc318-c4b6-40ec-b620-4b3ad43e2793'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/1afdc318-c4b6-40ec-b620-4b3ad43e2793.jpg"]'),
  ('f9ed5766-27ad-4fe3-a5fd-43082730fab6'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/f9ed5766-27ad-4fe3-a5fd-43082730fab6.jpg"]'),
  ('e25e93e6-b7a4-4837-8035-d502c0d0ed54'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/e25e93e6-b7a4-4837-8035-d502c0d0ed54.jpg"]'),
  ('0d27cf60-2632-4522-831a-9972ffa648b9'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/0d27cf60-2632-4522-831a-9972ffa648b9.jpg"]'),
  ('c0094588-4378-47b6-8b20-8df16b66e748'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/c0094588-4378-47b6-8b20-8df16b66e748.jpg"]'),
  ('8bf8eb4c-bbb1-4707-9852-1adf2634e8a4'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/8bf8eb4c-bbb1-4707-9852-1adf2634e8a4.jpg"]'),
  ('71636d17-f2b3-4c34-95fa-cd952404ee19'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/71636d17-f2b3-4c34-95fa-cd952404ee19.jpg"]'),
  ('6b774f1f-54e7-4c1a-b0d2-03f2071ebf7b'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/6b774f1f-54e7-4c1a-b0d2-03f2071ebf7b.jpg"]'),
  ('d08498c8-18e5-4b65-832d-db694a3d17e2'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/d08498c8-18e5-4b65-832d-db694a3d17e2.jpg"]'),
  ('9925011c-f1aa-4238-97fd-4ea6f3b540d1'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/9925011c-f1aa-4238-97fd-4ea6f3b540d1.jpg"]'),
  ('5f204c8f-5937-46b5-befd-86b1d8efcf62'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/5f204c8f-5937-46b5-befd-86b1d8efcf62.jpg"]'),
  ('c6ef1afe-d9f5-4847-a8f4-177414425013'::uuid,'["https://znnelrpyiknlxbfgepbl.supabase.co/storage/v1/object/public/range-photos/c6ef1afe-d9f5-4847-a8f4-177414425013.jpg"]')
) AS v(id, img)
WHERE r.id = v.id AND r.is_claimed = false AND r.post_images LIKE '%unsplash%'
RETURNING r.id, r.name;
