-- ============================================================
--  MUN Conference Manager — database schema
--  Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- ---------- Committees ----------
CREATE TABLE IF NOT EXISTS public.committees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ---------- Delegates ----------
CREATE TABLE IF NOT EXISTS public.delegates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  grade        TEXT,
  committee_id UUID NOT NULL,
  country      TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'Delegate',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  -- Explicitly named so PostgREST embeds can pin it with
  -- `committees!delegates_single_committee_link (...)`
  CONSTRAINT delegates_single_committee_link
    FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE
);

-- ---------- Scores ----------
CREATE TABLE IF NOT EXISTS public.scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegate_id UUID NOT NULL REFERENCES public.delegates(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  points      NUMERIC(10,2) NOT NULL DEFAULT 0,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS idx_delegates_committee ON public.delegates(committee_id);
CREATE INDEX IF NOT EXISTS idx_delegates_grade ON public.delegates(grade);
CREATE INDEX IF NOT EXISTS idx_scores_delegate ON public.scores(delegate_id);
CREATE INDEX IF NOT EXISTS idx_scores_category ON public.scores(category);

-- ---------- Realtime ----------
-- REPLICA IDENTITY FULL makes DELETE payloads include the full old row
ALTER TABLE public.committees REPLICA IDENTITY FULL;
ALTER TABLE public.delegates  REPLICA IDENTITY FULL;
ALTER TABLE public.scores     REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.delegates;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ---------- Row Level Security ----------
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores     ENABLE ROW LEVEL SECURITY;

-- Open access for anonymous conference use.
-- Tighten these + add Supabase Auth if the app is exposed publicly.
DROP POLICY IF EXISTS "Allow full access for anonymous users" ON public.committees;
DROP POLICY IF EXISTS "Allow full access for anonymous users" ON public.delegates;
DROP POLICY IF EXISTS "Allow full access for anonymous users" ON public.scores;

CREATE POLICY "Allow full access for anonymous users" ON public.committees
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anonymous users" ON public.delegates
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anonymous users" ON public.scores
  FOR ALL USING (true) WITH CHECK (true);

-- ---------- updated_at triggers ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_committees_updated_at ON public.committees;
CREATE TRIGGER update_committees_updated_at
  BEFORE UPDATE ON public.committees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_delegates_updated_at ON public.delegates;
CREATE TRIGGER update_delegates_updated_at
  BEFORE UPDATE ON public.delegates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scores_updated_at ON public.scores;
CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Convenience view: running totals ----------
CREATE OR REPLACE VIEW public.score_totals AS
SELECT
  d.id AS delegate_id,
  d.name,
  d.country,
  d.grade,
  d.role,
  d.committee_id,
  c.name AS committee_name,
  COALESCE(SUM(s.points), 0) AS total_score
FROM public.delegates d
LEFT JOIN public.committees c ON c.id = d.committee_id
LEFT JOIN public.scores s ON s.delegate_id = d.id
GROUP BY d.id, d.name, d.country, d.grade, d.role, d.committee_id, c.name;