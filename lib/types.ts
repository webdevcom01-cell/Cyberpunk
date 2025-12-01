export interface Agent {
  id: string
  name: string
  role: string
  goal: string
  backstory: string | null
  model: string
  temperature: number
  max_tokens: number
  tools: string[]
  status: "idle" | "active" | "error" | "paused"
  total_executions: number
  success_rate: number
  avg_response_time: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  name: string
  description: string
  agent_id: string | null
  dependencies: string[]
  priority: "low" | "medium" | "high" | "critical"
  expected_output: string | null
  context_variables: Record<string, unknown>
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  execution_order: number | null
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  name: string
  description: string | null
  agent_ids: string[]
  task_ids: string[]
  status: "draft" | "active" | "paused" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface ExecutionTrace {
  id: string
  trace_id: string
  span_id: string
  parent_span_id: string | null
  workflow_id: string | null
  agent_id: string | null
  task_id: string | null
  span_name: string
  span_type: "workflow" | "task" | "agent" | "tool" | "llm"
  start_time: string
  end_time: string | null
  duration_ms: number | null
  status: "running" | "completed" | "failed" | "cancelled"
  input_data: Record<string, unknown> | null
  output_data: Record<string, unknown> | null
  metadata: Record<string, unknown>
  error_message: string | null
  tokens_used: number | null
  cost_usd: number | null
  created_at: string
}

export interface ExecutionLog {
  id: string
  trace_id: string
  span_id: string
  log_level: "debug" | "info" | "warn" | "error"
  message: string
  timestamp: string
  metadata: Record<string, unknown>
}

export interface Metric {
  id: string
  trace_id: string
  metric_name: string
  metric_value: number
  metric_type: "counter" | "gauge" | "histogram"
  tags: Record<string, unknown>
  timestamp: string
}

export interface Integration {
  id: string
  name: string
  type: "api" | "database" | "webhook" | "storage"
  config: Record<string, unknown>
  credentials: Record<string, unknown> | null
  enabled: boolean
  created_at: string
  updated_at: string
}
