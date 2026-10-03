-- Consolidate the grade ladder onto the canonical list.
--
-- The database had drifted into several spellings of the same tiers, which
-- broke grade sorting: "IGCSE Year 1" sorted below "Grade 4" and
-- "Pre-Matric" sorted above "Year 3".
--
-- Target ladder (senior to junior):
--   Year 3, Year 2, Year 1, 10 Matric, 9 Matric, 8 Matric,
--   Grade 7, Grade 6, Grade 5, Grade 4
--
-- Pre-Matric and Pre-IGCSE are both the Grade 7 tier.
--
-- Safe to re-run: every statement is idempotent.

BEGIN;

-- Pre-Matric and Pre-IGCSE are the Grade 7 tier.
UPDATE public.delegates
SET grade = 'Grade 7'
WHERE grade IN ('Pre-Matric', 'Pre-IGCSE');

-- Matric is written inconsistently ("Grade 9M", "Grade 9", "9M").
UPDATE public.delegates
SET grade = '10 Matric' WHERE grade IN ('Grade 10M', 'Grade 10');
UPDATE public.delegates
SET grade = '9 Matric'  WHERE grade IN ('Grade 9M', 'Grade 9');
UPDATE public.delegates
SET grade = '8 Matric'  WHERE grade IN ('Grade 8M', 'Grade 8');

-- Senior secondary is written both "Year 3" and "IGCSE Year 3".
UPDATE public.delegates
SET grade = 'Year 3' WHERE grade = 'IGCSE Year 3';
UPDATE public.delegates
SET grade = 'Year 2' WHERE grade = 'IGCSE Year 2';
UPDATE public.delegates
SET grade = 'Year 1' WHERE grade = 'IGCSE Year 1';

-- Normalise capitalisation on the primary ladder without changing the tier.
UPDATE public.delegates
SET grade = initcap(grade)
WHERE grade IN ('grade 4', 'grade 5', 'grade 6', 'grade 7',
                'GRADE 4', 'GRADE 5', 'GRADE 6', 'GRADE 7');

COMMIT;

-- Report the result. Every value here should be on the canonical ladder.
WITH ladder(value, ord) AS (
  SELECT * FROM unnest(ARRAY[
    'Year 3','Year 2','Year 1','10 Matric','9 Matric','8 Matric',
    'Grade 7','Grade 6','Grade 5','Grade 4'
  ]) WITH ORDINALITY
)
SELECT d.grade,
       count(*)::int AS delegates,
       coalesce(l.ord, 999) AS seniority
FROM public.delegates d
LEFT JOIN ladder l ON l.value = d.grade
GROUP BY d.grade, l.ord
ORDER BY coalesce(l.ord, 999), d.grade;