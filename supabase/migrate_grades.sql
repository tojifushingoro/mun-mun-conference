-- ============================================================
--  Grade rename migration
--  Run ONCE in Supabase Dashboard -> SQL Editor
--
--  Grades 3-7   : unchanged
--  Grades 8-10  : 8 -> "8 Matric", 9 -> "9 Matric", 10 -> "10 Matric"
--  Grades 11-12 : -> "Year 1" / "Year 2"   (Year 3 is new, for Grade 13)
--
--  Handles every variant that may have been typed: "8", "Grade 8", "grade 8".
-- ============================================================

BEGIN;

-- 8 / 9 / 10 -> Matric
UPDATE public.delegates SET grade = '8 Matric'
WHERE lower(trim(grade)) IN ('8', 'grade 8');

UPDATE public.delegates SET grade = '9 Matric'
WHERE lower(trim(grade)) IN ('9', 'grade 9');

UPDATE public.delegates SET grade = '10 Matric'
WHERE lower(trim(grade)) IN ('10', 'grade 10');

-- 11 / 12 / 13 -> Year 1 / Year 2 / Year 3
UPDATE public.delegates SET grade = 'Year 1'
WHERE lower(trim(grade)) IN ('11', 'grade 11');

UPDATE public.delegates SET grade = 'Year 2'
WHERE lower(trim(grade)) IN ('12', 'grade 12');

UPDATE public.delegates SET grade = 'Year 3'
WHERE lower(trim(grade)) IN ('13', 'grade 13');

-- Normalise the untouched primary grades so every row uses one exact spelling
UPDATE public.delegates SET grade = 'Grade ' || trim(grade)
WHERE trim(grade) IN ('3','4','5','6','7');

UPDATE public.delegates SET grade = 'Grade ' || trim(grade)
WHERE lower(trim(grade)) IN ('grade 3','grade 4','grade 5','grade 6','grade 7')
  AND grade NOT LIKE 'Grade%';

COMMIT;

-- ---------- Verify: expect 11 distinct values, no bare numbers ----------
-- SELECT grade, count(*) FROM public.delegates GROUP BY grade ORDER BY grade;