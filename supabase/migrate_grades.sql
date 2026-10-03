-- ============================================================
--  Grade list alignment
--  Run ONCE in Supabase -> SQL Editor
--
--  The school hierarchy changed. Current list, top to bottom:
--    Year 3, Year 2, Year 1,
--    10 Matric, 9 Matric, 8 Matric,
--    Pre-IGCSE,
--    Grade 6, 5, 4, 3, 2, 1
--
--  Grade 7 is replaced by Pre-IGCSE. Grades 7-10 as plain numbers
--  now map onto the Matric levels.
--
--  Safe: only rewrites values that no longer exist as-is.
--  Existing Matric, Year and Grade 1-6 rows are left untouched.
-- ============================================================

BEGIN;

-- Grade 7 -> Pre-IGCSE
UPDATE public.delegates SET grade = 'Pre-IGCSE'
WHERE lower(trim(grade)) IN ('grade 7', '7');

-- Plain 8/9/10 -> the Matric levels
UPDATE public.delegates SET grade = '8 Matric'
WHERE lower(trim(grade)) IN ('grade 8', '8');

UPDATE public.delegates SET grade = '9 Matric'
WHERE lower(trim(grade)) IN ('grade 9', '9');

UPDATE public.delegates SET grade = '10 Matric'
WHERE lower(trim(grade)) IN ('grade 10', '10');

-- Primary grades: normalise to the "Grade N" spelling
UPDATE public.delegates SET grade = 'Grade ' || trim(grade)
WHERE trim(grade) IN ('1','2','3','4','5','6')
   OR lower(trim(grade)) IN ('grade 1','grade 2','grade 3','grade 4','grade 5','grade 6');

COMMIT;

-- ---------- Verify ----------
-- SELECT grade, count(*) FROM public.delegates
-- GROUP BY grade
-- ORDER BY array_position(
--   ARRAY['Year 3','Year 2','Year 1','10 Matric','9 Matric','8 Matric',
--         'Pre-IGCSE','Grade 6','Grade 5','Grade 4','Grade 3','Grade 2','Grade 1'],
--   grade
-- );