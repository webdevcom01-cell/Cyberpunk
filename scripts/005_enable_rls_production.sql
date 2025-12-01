-- Novi script za primenu RLS policies u production
-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON agents;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON workflows;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON execution_traces;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON execution_logs;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON metrics;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON integrations;

-- Workspace-based RLS policies
-- Users can only see data in workspaces they belong to

-- Agents policies
CREATE POLICY "Users can view agents in their workspaces" ON agents
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agents in their workspaces" ON agents
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can update agents in their workspaces" ON agents
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can delete agents in their workspaces" ON agents
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their workspaces" ON tasks
  FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tasks in their workspaces" ON tasks
  FOR INSERT
  WITH CHECK (
    workflow_id IN (
      SELECT id FROM workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'member')
      )
    )
  );

CREATE POLICY "Users can update tasks in their workspaces" ON tasks
  FOR UPDATE
  USING (
    workflow_id IN (
      SELECT id FROM workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'member')
      )
    )
  );

CREATE POLICY "Users can delete tasks in their workspaces" ON tasks
  FOR DELETE
  USING (
    workflow_id IN (
      SELECT id FROM workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Workflows policies
CREATE POLICY "Users can view workflows in their workspaces" ON workflows
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workflows in their workspaces" ON workflows
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can update workflows in their workspaces" ON workflows
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can delete workflows in their workspaces" ON workflows
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Execution traces policies
CREATE POLICY "Users can view execution traces in their workspaces" ON execution_traces
  FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Execution logs policies
CREATE POLICY "Users can view execution logs in their workspaces" ON execution_logs
  FOR SELECT
  USING (
    trace_id IN (
      SELECT id FROM execution_traces
      WHERE workflow_id IN (
        SELECT id FROM workflows
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Metrics policies
CREATE POLICY "Users can view metrics in their workspaces" ON metrics
  FOR SELECT
  USING (
    entity_id IN (
      SELECT id FROM agents
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
    OR
    entity_id IN (
      SELECT id FROM workflows
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Integrations policies
CREATE POLICY "Users can view integrations in their workspaces" ON integrations
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create integrations in their workspaces" ON integrations
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Users can update integrations in their workspaces" ON integrations
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete integrations in their workspaces" ON integrations
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Workspaces policies
CREATE POLICY "Users can view their workspaces" ON workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
  FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Workspace members policies
CREATE POLICY "Users can view members in their workspaces" ON workspace_members
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace members" ON workspace_members
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Service role bypass (for internal operations)
ALTER TABLE agents FORCE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE workflows FORCE ROW LEVEL SECURITY;
