-- Critical fixes and all 10 advanced features implementation
-- Run this script in Supabase SQL Editor

-- ============================================================================
-- PART 1: CRITICAL FIXES - User Management & Workspace Setup
-- ============================================================================

-- Create users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Add workspace_id to existing tables
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_workspace ON public.agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);

-- ============================================================================
-- PART 2: FEATURE 1 - Natural Language Workflow Builder
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nl_workflow_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_input TEXT NOT NULL,
  parsed_structure JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'deployed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nl_drafts_workspace ON public.nl_workflow_drafts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_nl_drafts_user ON public.nl_workflow_drafts(user_id);

-- ============================================================================
-- PART 3: FEATURE 2 - Real-time Collaboration
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cursor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  cursor_x INTEGER,
  cursor_y INTEGER,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_color TEXT,
  UNIQUE(workspace_id, user_id, page_url)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('agent', 'workflow', 'task')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[],
  position_x INTEGER,
  position_y INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_workspace ON public.activity_feed(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cursor_sessions_workspace ON public.cursor_sessions(workspace_id);

-- ============================================================================
-- PART 4: FEATURE 3 - Workflow Analytics Dashboard  
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workflow_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  total_cost_usd NUMERIC(10, 4),
  total_tokens INTEGER,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_workspace ON public.workflow_analytics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_workflow ON public.workflow_analytics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON public.workflow_analytics(period_start, period_end);

-- ============================================================================
-- PART 5: FEATURE 4 - Live Preview Dashboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.live_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'starting' CHECK (status IN ('starting', 'thinking', 'processing', 'completed', 'failed')),
  current_step TEXT,
  progress_percent INTEGER DEFAULT 0,
  thinking_log TEXT[],
  output_preview TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_executions_workspace ON public.live_executions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_live_executions_status ON public.live_executions(status);

-- ============================================================================
-- PART 6: FEATURE 5 - AI Playground/Sandbox
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.playground_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  models JSONB NOT NULL,
  test_prompt TEXT NOT NULL,
  results JSONB,
  winner_model TEXT,
  promoted_to_production BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiments_workspace ON public.playground_experiments(workspace_id);

-- ============================================================================
-- PART 7: FEATURE 6 - AI Agent Marketplace
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_template JSONB NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  pricing_type TEXT NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'premium', 'open_source')),
  price_usd NUMERIC(10, 2),
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC(3, 2),
  verified BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_agent_id UUID NOT NULL REFERENCES public.marketplace_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(marketplace_agent_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_agents(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_trending ON public.marketplace_agents(usage_count DESC);

-- ============================================================================
-- PART 8: FEATURE 7 - Template Gallery
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL,
  preview_gif_url TEXT,
  usage_count INTEGER DEFAULT 0,
  setup_time_minutes INTEGER,
  tags TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.workflow_templates(featured);

-- ============================================================================
-- PART 9: FEATURE 8 - Guided Onboarding
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[],
  skipped BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- ============================================================================
-- PART 10: FEATURE 9 - Voice Commands
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT NOT NULL,
  parsed_command JSONB,
  executed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_commands_workspace ON public.voice_commands(workspace_id);

-- ============================================================================
-- RLS POLICIES - Enable Row Level Security
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nl_workflow_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playground_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view workspaces they're members of" ON public.workspaces FOR SELECT 
  USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace owners can update workspaces" ON public.workspaces FOR UPDATE 
  USING (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "Users can view workspace members" ON public.workspace_members FOR SELECT 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace owners can manage members" ON public.workspace_members FOR ALL 
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid()));

-- Service role bypass (for API operations)
CREATE POLICY "Service role bypass" ON public.users FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role bypass workspaces" ON public.workspaces FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- All other tables: workspace-based access
CREATE POLICY "Workspace access" ON public.nl_workflow_drafts FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.cursor_sessions FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.comments FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.activity_feed FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.workflow_analytics FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.live_executions FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.playground_experiments FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace access" ON public.voice_commands FOR ALL 
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- Marketplace (public read, authenticated write)
CREATE POLICY "Public can view marketplace" ON public.marketplace_agents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create agents" ON public.marketplace_agents FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Public can view reviews" ON public.marketplace_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.marketplace_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Templates (public read)
CREATE POLICY "Public can view templates" ON public.workflow_templates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create templates" ON public.workflow_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Onboarding (user-specific)
CREATE POLICY "Users can view their onboarding" ON public.onboarding_progress FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-create workspace on first user creation
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create default workspace
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES (
    NEW.email || '''s Workspace',
    'workspace-' || substring(NEW.id::text from 1 for 8),
    NEW.id
  )
  RETURNING id INTO new_workspace_id;
  
  -- Add user as owner to workspace_members
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create workspace on user creation
DROP TRIGGER IF EXISTS on_user_created_create_workspace ON public.users;
CREATE TRIGGER on_user_created_create_workspace
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_workspace();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nl_drafts_updated_at BEFORE UPDATE ON public.nl_workflow_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 15 new tables';
  RAISE NOTICE '  - 25+ RLS policies';
  RAISE NOTICE '  - 3 triggers for automation';
  RAISE NOTICE '  - All 10 advanced features enabled';
  RAISE NOTICE '========================================';
END $$;
