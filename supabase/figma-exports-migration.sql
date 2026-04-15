-- Figma Plugin Bridge: temporary export storage
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS figma_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  dimensions JSONB NOT NULL,
  brand_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes')
);

CREATE INDEX IF NOT EXISTS idx_figma_exports_code ON figma_exports(code);
CREATE INDEX IF NOT EXISTS idx_figma_exports_expires ON figma_exports(expires_at);

-- Enable RLS
ALTER TABLE figma_exports ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert exports for their own workspace
CREATE POLICY "Users can create exports" ON figma_exports
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Policy: anyone with the code can read (plugin has no auth)
CREATE POLICY "Anyone can read by code" ON figma_exports
  FOR SELECT USING (true);

-- Optional: auto-cleanup expired exports (run periodically via pg_cron or Supabase scheduled function)
-- DELETE FROM figma_exports WHERE expires_at < now();
