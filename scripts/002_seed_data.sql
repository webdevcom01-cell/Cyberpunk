-- Insert sample agents
INSERT INTO agents (name, role, goal, backstory, model, tools, status, total_executions, success_rate, avg_response_time)
VALUES
  ('Research Analyst', 'Senior Researcher', 'Conduct comprehensive research and analysis on given topics', 'Expert researcher with 10+ years of experience in data analysis and market research', 'openai/gpt-4', ARRAY['web_search', 'data_analysis'], 'active', 156, 94.50, 2800),
  ('Code Generator', 'Senior Developer', 'Generate high-quality, production-ready code', 'Full-stack developer specializing in TypeScript, Python, and modern frameworks', 'anthropic/claude-sonnet-4', ARRAY['code_interpreter', 'file_system'], 'active', 89, 91.20, 3200),
  ('Content Writer', 'Creative Writer', 'Create engaging and SEO-optimized content', 'Professional content writer with expertise in technical and creative writing', 'openai/gpt-4', ARRAY['web_search', 'grammar_check'], 'idle', 234, 96.80, 1900);

-- Insert sample tasks
INSERT INTO tasks (name, description, agent_id, priority, expected_output, status, execution_order)
SELECT 
  'Market Analysis',
  'Analyze current market trends and competitor landscape',
  id,
  'high',
  'Comprehensive market analysis report with actionable insights',
  'completed',
  1
FROM agents WHERE role = 'Senior Researcher'
LIMIT 1;

INSERT INTO tasks (name, description, agent_id, priority, expected_output, status, execution_order)
SELECT 
  'API Development',
  'Develop RESTful API endpoints with proper error handling',
  id,
  'critical',
  'Production-ready API code with tests',
  'running',
  2
FROM agents WHERE role = 'Senior Developer'
LIMIT 1;

INSERT INTO tasks (name, description, agent_id, priority, expected_output, status, execution_order)
SELECT 
  'Documentation',
  'Create comprehensive technical documentation',
  id,
  'medium',
  'Clear and detailed documentation',
  'pending',
  3
FROM agents WHERE role = 'Creative Writer'
LIMIT 1;

-- Insert sample workflow
INSERT INTO workflows (name, description, status)
VALUES
  ('Product Launch', 'Complete workflow for new product launch', 'active');

-- Insert sample execution traces
INSERT INTO execution_traces (trace_id, span_id, workflow_id, agent_id, span_name, span_type, start_time, end_time, duration_ms, status, tokens_used, cost_usd)
SELECT 
  uuid_generate_v4(),
  uuid_generate_v4(),
  w.id,
  a.id,
  'Market Research Execution',
  'agent',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour 45 minutes',
  900000,
  'completed',
  3500,
  0.0875
FROM workflows w, agents a
WHERE w.name = 'Product Launch' AND a.role = 'Senior Researcher'
LIMIT 1;

-- Insert sample logs
INSERT INTO execution_logs (trace_id, span_id, log_level, message, metadata)
SELECT 
  trace_id,
  span_id,
  'info',
  'Agent initialized successfully',
  '{"model": "openai/gpt-4", "temperature": 0.7}'::jsonb
FROM execution_traces
LIMIT 1;

INSERT INTO execution_logs (trace_id, span_id, log_level, message, metadata)
SELECT 
  trace_id,
  span_id,
  'info',
  'Task execution started',
  '{"task": "Market Analysis", "priority": "high"}'::jsonb
FROM execution_traces
LIMIT 1;
