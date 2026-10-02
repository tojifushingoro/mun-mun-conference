-- ============================================================
--  DIAGNOSTIC - read only, changes nothing
--  Run in Supabase -> SQL Editor and paste the output back.
-- ============================================================

-- A) Every column in scores, with any odd spacing made obvious
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'scores'
ORDER BY ordinal_position;

-- B) How many score rows would be lost if we rebuild the table?
SELECT count(*) AS score_rows FROM public.scores;

-- C) Check the other two tables for the same hand-built naming problem
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('delegates', 'committees')
  AND (column_name LIKE '% %' OR is_nullable = 'NO')
ORDER BY table_name, ordinal_position;