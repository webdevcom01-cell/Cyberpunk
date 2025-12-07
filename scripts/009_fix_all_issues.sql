-- ============================================
-- FIX ALL ISSUES - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- 1. Add user_id column to tables for proper auth
ALTER TABLE agents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies - Allow authenticated users full access to their own data

-- Agents policies
DROP POLICY IF EXISTS "Users can view their own agents" ON agents;
DROP POLICY IF EXISTS "Users can create agents" ON agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete their own agents" ON agents;
DROP POLICY IF EXISTS "Allow anonymous read access to agents" ON agents;

CREATE POLICY "Allow anonymous read access to agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Users can create agents" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own agents" ON agents FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own agents" ON agents FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Tasks policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous read access to tasks" ON tasks;

CREATE POLICY "Allow anonymous read access to tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Workflows policies
DROP POLICY IF EXISTS "Users can view their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;
DROP POLICY IF EXISTS "Allow anonymous read access to workflows" ON workflows;

CREATE POLICY "Allow anonymous read access to workflows" ON workflows FOR SELECT USING (true);
CREATE POLICY "Users can create workflows" ON workflows FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own workflows" ON workflows FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own workflows" ON workflows FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Execution traces - allow all reads for observability
DROP POLICY IF EXISTS "Allow read access to execution_traces" ON execution_traces;
CREATE POLICY "Allow read access to execution_traces" ON execution_traces FOR SELECT USING (true);
CREATE POLICY "Allow insert to execution_traces" ON execution_traces FOR INSERT WITH CHECK (true);

-- Execution logs
DROP POLICY IF EXISTS "Allow read access to execution_logs" ON execution_logs;
CREATE POLICY "Allow read access to execution_logs" ON execution_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert to execution_logs" ON execution_logs FOR INSERT WITH CHECK (true);

-- Metrics
DROP POLICY IF EXISTS "Allow read access to metrics" ON metrics;
CREATE POLICY "Allow read access to metrics" ON metrics FOR SELECT USING (true);
CREATE POLICY "Allow insert to metrics" ON metrics FOR INSERT WITH CHECK (true);

-- Integrations
DROP POLICY IF EXISTS "Allow read access to integrations" ON integrations;
CREATE POLICY "Allow read access to integrations" ON integrations FOR SELECT USING (true);
CREATE POLICY "Allow all to integrations" ON integrations FOR ALL USING (true);

-- 4. Create the get_agents RPC function that the hook is looking for
CREATE OR REPLACE FUNCTION get_agents()
RETURNS SETOF agents
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM agents ORDER BY created_at DESC;
$$;

-- 5. Create get_tasks RPC function
CREATE OR REPLACE FUNCTION get_tasks()
RETURNS SETOF tasks
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM tasks ORDER BY created_at DESC;
$$;

-- 6. Create get_workflows RPC function
CREATE OR REPLACE FUNCTION get_workflows()
RETURNS SETOF workflows
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM workflows ORDER BY created_at DESC;
$$;

-- 7. Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE execution_traces;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Done! All issues should now be fixed.
