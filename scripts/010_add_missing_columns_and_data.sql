-- ADD MISSING COLUMNS - RUN IN SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/maoujqusrhrjajxncogr/sql

-- Add config column to workflows
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Add any other potentially missing columns
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS edges JSONB DEFAULT '[]';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '{}';

-- Insert sample data so dashboard shows something
INSERT INTO agents (name, role, goal, backstory, model, temperature, max_tokens, tools, status, total_executions, success_rate, avg_response_time)
VALUES 
  ('Research Agent', 'Senior Researcher', 'Conduct thorough research and provide comprehensive analysis', 'Expert researcher with years of experience in data analysis', 'openai/gpt-4', 0.7, 2000, ARRAY['web_search', 'document_analysis', 'summarization'], 'active', 42, 94.5, 1250),
  ('Writing Agent', 'Content Writer', 'Create engaging and well-structured content', 'Professional writer specializing in technical documentation', 'openai/gpt-4', 0.8, 3000, ARRAY['text_generation', 'editing', 'formatting'], 'active', 38, 91.2, 980),
  ('Code Agent', 'Software Developer', 'Write clean, efficient, and maintainable code', 'Full-stack developer with expertise in multiple languages', 'openai/gpt-4', 0.5, 4000, ARRAY['code_generation', 'debugging', 'code_review'], 'idle', 56, 96.8, 1500)
ON CONFLICT DO NOTHING;

INSERT INTO tasks (name, description, priority, status, execution_order)
VALUES 
  ('Research Market Trends', 'Analyze current market trends in AI industry', 'high', 'completed', 1),
  ('Generate Report', 'Create comprehensive report based on research', 'medium', 'pending', 2),
  ('Code Review', 'Review and optimize existing codebase', 'low', 'pending', 3)
ON CONFLICT DO NOTHING;

INSERT INTO workflows (name, description, status, config)
VALUES 
  ('Research Pipeline', 'Complete research and analysis workflow', 'active', '{"autoRetry": true, "maxRetries": 3}'),
  ('Content Creation', 'End-to-end content creation workflow', 'draft', '{}')
ON CONFLICT DO NOTHING;
