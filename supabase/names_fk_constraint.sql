-- ============================================================
--  Name the delegates -> committees foreign key
--  Run ONCE in Supabase Dashboard -> SQL Editor
--
--  Why: the app embeds the committee with an explicit constraint hint,
--  `committees!delegates_single_committee_link ( id, name )`.
--  PostgREST can only resolve that if a constraint by that exact name exists.
--  Postgres auto-named it `delegates_committee_id_fkey`, so it must be renamed.
--
--  Safe to run: drops the old auto-named constraint, re-adds it with the
--  new name. Existing rows and the ON DELETE CASCADE behaviour are preserved.
-- ============================================================

BEGIN;

ALTER TABLE public.delegates DROP CONSTRAINT IF EXISTS delegates_committee_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'delegates_single_committee_link'
  ) THEN
    ALTER TABLE public.delegates
      ADD CONSTRAINT delegates_single_committee_link
      FOREIGN KEY (committee_id)
      REFERENCES public.committees(id)
      ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;

-- ---------- Verify ----------
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.delegates'::regclass AND contype = 'f';