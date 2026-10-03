-- ============================================================
--  Rename the role "Vice Chair" to "ACD"
--  Run ONCE in Supabase -> SQL Editor
--
--  The app's role list is now:
--    'Chair'  'ACD'  'Delegate'  'Observer'
--  This rewrites existing rows so nobody is left on the old label.
--
--  Safe: only touches rows whose role is exactly 'Vice Chair'.
-- ============================================================

BEGIN;

UPDATE public.delegates SET role = 'ACD'
WHERE lower(trim(role)) IN ('vice chair', 'vicechair', 'vice-chair');

COMMIT;

-- ---------- Verify ----------
-- SELECT role, count(*) FROM public.delegates
-- GROUP BY role
-- ORDER BY array_position(ARRAY['Chair','ACD','Delegate','Observer'], role);