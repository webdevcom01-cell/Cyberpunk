-- Sprint 1 - Cost Tracking Schema
-- Run this first to enable AI cost tracking

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add cost tracking columns to execution_traces
ALTER TABLE execution_traces
ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
ADD COLUMN IF NOT EXISTS model_used VARCHAR(50),
ADD COLUMN IF NOT EXISTS cost_usd DECIMAL(10, 6) DEFAULT 0;

-- Create workspace_usage table for tracking monthly costs
CREATE TABLE IF NOT EXISTS workspace_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 2) DEFAULT 0,
  budget_limit_usd DECIMAL(10, 2),
  alert_threshold DECIMAL(3, 2) DEFAULT 0.8,
  paused BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, period_start)
);

-- Create cost_alerts table for budget notifications
CREATE TABLE IF NOT EXISTS cost_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'threshold', 'budget_exceeded', 'daily_summary'
  message TEXT NOT NULL,
  current_usage DECIMAL(10, 2),
  budget_limit DECIMAL(10, 2),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_execution_traces_cost ON execution_traces(workspace_id, created_at, cost_usd);
CREATE INDEX IF NOT EXISTS idx_workspace_usage_workspace ON workspace_usage(workspace_id, period_start);
CREATE INDEX IF NOT EXISTS idx_workspace_usage_period ON workspace_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_workspace ON cost_alerts(workspace_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_acknowledged ON cost_alerts(acknowledged, sent_at);

-- Function to increment workspace usage
CREATE OR REPLACE FUNCTION increment_workspace_usage(
  p_workspace_id UUID,
  p_tokens INTEGER,
  p_cost DECIMAL(10, 6),
  p_period_start TIMESTAMPTZ DEFAULT date_trunc('month', NOW())
)
RETURNS void AS $$
DECLARE
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_end := p_period_start + INTERVAL '1 month';
  
  INSERT INTO workspace_usage (
    workspace_id,
    period_start,
    period_end,
    total_tokens,
    total_cost_usd
  )
  VALUES (
    p_workspace_id,
    p_period_start,
    v_period_end,
    p_tokens,
    p_cost
  )
  ON CONFLICT (workspace_id, period_start)
  DO UPDATE SET
    total_tokens = workspace_usage.total_tokens + p_tokens,
    total_cost_usd = workspace_usage.total_cost_usd + p_cost,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if workspace is over budget
CREATE OR REPLACE FUNCTION check_workspace_budget(p_workspace_id UUID)
RETURNS TABLE(
  is_over_budget BOOLEAN,
  current_usage DECIMAL(10, 2),
  budget_limit DECIMAL(10, 2),
  usage_percent DECIMAL(5, 2)
) AS $$
DECLARE
  v_usage workspace_usage%ROWTYPE;
BEGIN
  SELECT * INTO v_usage
  FROM workspace_usage
  WHERE workspace_id = p_workspace_id
    AND period_start = date_trunc('month', NOW())
  LIMIT 1;
  
  IF v_usage.budget_limit_usd IS NULL OR v_usage.budget_limit_usd = 0 THEN
    RETURN QUERY SELECT false, v_usage.total_cost_usd, 0::DECIMAL(10,2), 0::DECIMAL(5,2);
  ELSE
    RETURN QUERY SELECT 
      v_usage.total_cost_usd >= v_usage.budget_limit_usd,
      v_usage.total_cost_usd,
      v_usage.budget_limit_usd,
      (v_usage.total_cost_usd / v_usage.budget_limit_usd * 100)::DECIMAL(5,2);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for cost tracking tables
ALTER TABLE workspace_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;

-- Users can read their own workspace usage
CREATE POLICY "Users can view workspace usage"
ON workspace_usage FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Users can read their own cost alerts
CREATE POLICY "Users can view cost alerts"
ON cost_alerts FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Admins can update workspace usage (budget settings)
CREATE POLICY "Admins can update workspace usage"
ON workspace_usage FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Users can acknowledge their alerts
CREATE POLICY "Users can acknowledge alerts"
ON cost_alerts FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Insert default usage record for existing workspaces
INSERT INTO workspace_usage (workspace_id, period_start, period_end)
SELECT 
  id,
  date_trunc('month', NOW()),
  date_trunc('month', NOW()) + INTERVAL '1 month'
FROM workspaces
ON CONFLICT (workspace_id, period_start) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON workspace_usage TO authenticated;
GRANT ALL ON cost_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION increment_workspace_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_workspace_budget TO authenticated;

COMMENT ON TABLE workspace_usage IS 'Tracks AI usage and costs per workspace per billing period';
COMMENT ON TABLE cost_alerts IS 'Stores budget alerts and notifications for workspaces';
COMMENT ON FUNCTION increment_workspace_usage IS 'Increments token and cost counters for a workspace';
COMMENT ON FUNCTION check_workspace_budget IS 'Checks if a workspace has exceeded its budget';
