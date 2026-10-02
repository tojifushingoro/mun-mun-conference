-- ============================================================
--  Repair the scores table
--  Run in Supabase -> SQL Editor
--
--  Fixes: PGRST204 "Could not find the 'category' column of 'scores'"
--
--  Safe: additive only. Creates the table if it is missing, and adds
--  any missing columns to an existing table. Never drops or renames
--  anything, so existing score rows are preserved.
-- ============================================================

BEGIN;

-- 1. Create the table only if it does not exist yet
CREATE TABLE IF NOT EXISTS public.scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegate_id UUID NOT NULL REFERENCES public.delegates(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'Speech',
  points      NUMERIC(10,2) NOT NULL DEFAULT 0,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Add any columns the existing table is missing.
--    Defaults are supplied so this succeeds on a table that already has rows.
ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS category   TEXT NOT NULL DEFAULT 'Speech';
ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS points     NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS note       TEXT;
ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());
ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());

-- 3. Realtime needs the full old row on UPDATE/DELETE
ALTER TABLE public.scores REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 4. Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for anonymous users" ON public.scores;
CREATE POLICY "Allow full access for anonymous users" ON public.scores
  FOR ALL USING (true) WITH CHECK (true);

COMMIT;

-- ---------- Verify: category must now appear ----------
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'scores' ORDER BY ordinal_position;