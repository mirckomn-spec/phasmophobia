-- Schema Supabase / PostgreSQL

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghost_type TEXT,
  difficulty TEXT,
  won BOOLEAN NOT NULL DEFAULT false,
  naltic_survived BOOLEAN NOT NULL DEFAULT true,
  neat_survived BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_investigation_minutes INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (id, total_investigation_minutes)
VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_ghost_type ON matches (ghost_type);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
