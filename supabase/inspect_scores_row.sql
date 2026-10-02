-- ============================================================
--  INSPECT the row in scores before we replace the table
--  Read only - changes nothing. Paste the output back.
-- ============================================================

-- A) Every column the current scores table has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scores'
ORDER BY ordinal_position;

-- B) The actual row
SELECT * FROM public.scores;