-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tasks_name ON tasks USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows USING gin (name gin_trgm_ops);

-- Indexes for JSON columns
CREATE INDEX IF NOT EXISTS idx_execution_traces_metadata ON execution_traces USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_tasks_context_variables ON tasks USING gin (context_variables);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_execution_traces_workflow_status ON execution_traces(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_execution_traces_agent_status ON execution_traces(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_status ON tasks(agent_id, status);

-- Performance monitoring
CREATE INDEX IF NOT EXISTS idx_execution_traces_duration ON execution_traces(duration_ms) WHERE duration_ms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_execution_traces_cost ON execution_traces(cost_usd) WHERE cost_usd IS NOT NULL;
