-- ============================================================
--  Allow staff roles to have no country
--  Run ONCE in Supabase Dashboard -> SQL Editor
--
--  Chairs, Vice Chairs, Rapporteurs, Observers and Gavel officers
--  represent the conference, not a nation, so they can now be
--  registered without a country. Country representatives
--  (role = 'Delegate') still supply one, enforced in the UI.
--
--  Safe to run: only relaxes a constraint, drops no data.
--  Existing delegates keep their countries untouched.
-- ============================================================

BEGIN;

ALTER TABLE public.delegates
  ALTER COLUMN country DROP NOT NULL;

COMMIT;

-- ---------- Verify: is_nullable should now read 'YES' ----------
-- SELECT column_name, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'delegates' AND column_name = 'country';