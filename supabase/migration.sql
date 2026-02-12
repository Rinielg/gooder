-- ============================================================
-- Brand Voice Platform — Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── WORKSPACES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- ── WORKSPACE MEMBERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- ── BRAND PROFILES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'training', 'active', 'archived')),
  completeness INTEGER DEFAULT 0,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_modules TEXT[] DEFAULT '{}',
  tier_config JSONB DEFAULT NULL,
  training_sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ── PLATFORM STANDARDS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('predefined', 'custom')),
  category TEXT NOT NULL CHECK (category IN ('ux_journey', 'email', 'sms', 'push', 'general')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── OBJECTIVES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── DEFINITIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SAVED OUTPUTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('ux_journey', 'email', 'sms', 'push')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  adherence_score JSONB DEFAULT NULL,
  objective_scores JSONB DEFAULT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ── TRAINING DOCUMENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_content JSONB DEFAULT NULL,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'complete', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- ── CHAT SESSIONS (lightweight, for tracking only) ───────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'generation' CHECK (session_type IN ('generation', 'training')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ DEFAULT NULL
);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: check if current user is an admin of a workspace
CREATE OR REPLACE FUNCTION is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── WORKSPACE POLICIES ───────────────────────────────────────
CREATE POLICY "workspace_select" ON workspaces FOR SELECT
  USING (is_workspace_member(id));

CREATE POLICY "workspace_update" ON workspaces FOR UPDATE
  USING (is_workspace_admin(id));

-- ── WORKSPACE MEMBERS POLICIES ───────────────────────────────
CREATE POLICY "members_select" ON workspace_members FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "members_insert" ON workspace_members FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id) OR user_id = auth.uid());

CREATE POLICY "members_delete" ON workspace_members FOR DELETE
  USING (is_workspace_admin(workspace_id));

-- ── BRAND PROFILES POLICIES ─────────────────────────────────
CREATE POLICY "profiles_select" ON brand_profiles FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "profiles_insert" ON brand_profiles FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id));

CREATE POLICY "profiles_update" ON brand_profiles FOR UPDATE
  USING (is_workspace_admin(workspace_id));

CREATE POLICY "profiles_delete" ON brand_profiles FOR DELETE
  USING (is_workspace_admin(workspace_id));

-- ── PLATFORM STANDARDS POLICIES ──────────────────────────────
CREATE POLICY "standards_select" ON platform_standards FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "standards_insert" ON platform_standards FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id));

CREATE POLICY "standards_update" ON platform_standards FOR UPDATE
  USING (is_workspace_admin(workspace_id));

CREATE POLICY "standards_delete" ON platform_standards FOR DELETE
  USING (is_workspace_admin(workspace_id));

-- ── OBJECTIVES POLICIES ──────────────────────────────────────
CREATE POLICY "objectives_select" ON objectives FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "objectives_insert" ON objectives FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id));

CREATE POLICY "objectives_update" ON objectives FOR UPDATE
  USING (is_workspace_admin(workspace_id));

CREATE POLICY "objectives_delete" ON objectives FOR DELETE
  USING (is_workspace_admin(workspace_id));

-- ── DEFINITIONS POLICIES ─────────────────────────────────────
CREATE POLICY "definitions_select" ON definitions FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "definitions_insert" ON definitions FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id));

CREATE POLICY "definitions_update" ON definitions FOR UPDATE
  USING (is_workspace_admin(workspace_id));

CREATE POLICY "definitions_delete" ON definitions FOR DELETE
  USING (is_workspace_admin(workspace_id));

-- ── SAVED OUTPUTS POLICIES ───────────────────────────────────
CREATE POLICY "outputs_select" ON saved_outputs FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "outputs_insert" ON saved_outputs FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "outputs_delete" ON saved_outputs FOR DELETE
  USING (is_workspace_admin(workspace_id) OR created_by = auth.uid());

-- ── TRAINING DOCUMENTS POLICIES ──────────────────────────────
CREATE POLICY "training_docs_select" ON training_documents FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "training_docs_insert" ON training_documents FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- ── CHAT SESSIONS POLICIES ───────────────────────────────────
CREATE POLICY "sessions_select" ON chat_sessions FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "sessions_insert" ON chat_sessions FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ════════════════════════════════════════════════════════════
-- Run these separately if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('training-documents', 'training-documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exported-outputs', 'exported-outputs', false);

-- ════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace ON brand_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_standards_workspace ON platform_standards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_objectives_workspace ON objectives(workspace_id);
CREATE INDEX IF NOT EXISTS idx_definitions_workspace ON definitions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_outputs_workspace ON saved_outputs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_outputs_type ON saved_outputs(type);
CREATE INDEX IF NOT EXISTS idx_training_docs_profile ON training_documents(brand_profile_id);
