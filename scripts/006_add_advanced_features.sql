-- Migration: Add Advanced Features Tables
-- This adds support for collaboration, marketplace, templates, playground, voice commands, and analytics

-- Real-time Collaboration Tables
CREATE TABLE IF NOT EXISTS cursor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  page_url TEXT NOT NULL,
  cursor_x INTEGER NOT NULL,
  cursor_y INTEGER NOT NULL,
  color VARCHAR(20) NOT NULL,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX idx_cursor_sessions_workspace_active ON cursor_sessions(workspace_id, last_active);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_target ON comments(workspace_id, target_type, target_id);

CREATE TABLE IF NOT EXISTS comment_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  target_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_workspace ON activity_logs(workspace_id, created_at DESC);

-- Agent Marketplace Tables
CREATE TABLE IF NOT EXISTS marketplace_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  creator_id UUID NOT NULL,
  template_data JSONB NOT NULL,
  preview_gif TEXT,
  setup_time INTEGER NOT NULL DEFAULT 5,
  pricing VARCHAR(20) DEFAULT 'free',
  price DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketplace_agents_category ON marketplace_agents(category, rating DESC);
CREATE INDEX idx_marketplace_agents_usage ON marketplace_agents(usage_count DESC);

CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  template_data JSONB NOT NULL,
  preview_gif TEXT,
  preview_image TEXT,
  setup_time INTEGER NOT NULL DEFAULT 5,
  usage_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category, usage_count DESC);

-- AI Playground
CREATE TABLE IF NOT EXISTS playground_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  models JSONB NOT NULL,
  test_prompt TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '{}',
  winner VARCHAR(100),
  promoted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_playground_experiments_workspace ON playground_experiments(workspace_id, created_at DESC);

-- Voice Commands
CREATE TABLE IF NOT EXISTS voice_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  transcript TEXT NOT NULL,
  command TEXT NOT NULL,
  executed BOOLEAN DEFAULT FALSE,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_voice_commands_workspace ON voice_commands(workspace_id, created_at DESC);

-- Onboarding Progress
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enhanced Workflow Analytics
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_workflow_runs_workflow ON workflow_runs(workflow_id, start_time DESC);
CREATE INDEX idx_workflow_runs_workspace ON workflow_runs(workspace_id, start_time DESC);

-- Natural Language Workflow Builder
CREATE TABLE IF NOT EXISTS workflow_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  natural_language TEXT NOT NULL,
  parsed_structure JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_drafts_workspace ON workflow_drafts(workspace_id, created_at DESC);

-- Enable RLS on all new tables
ALTER TABLE cursor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE playground_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for workspace-based access)
CREATE POLICY "Users can view marketplace agents" ON marketplace_agents FOR SELECT TO authenticated USING (published = TRUE);
CREATE POLICY "Users can view templates" ON workflow_templates FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can manage their workspace data" ON cursor_sessions FOR ALL TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their workspace comments" ON comments FOR ALL TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their workspace activity" ON activity_logs FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their playground experiments" ON playground_experiments FOR ALL TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their voice commands" ON voice_commands FOR ALL TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their onboarding" ON onboarding_progress FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view their workflow runs" ON workflow_runs FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their workflow drafts" ON workflow_drafts FOR ALL TO authenticated USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));
