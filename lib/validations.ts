import { z } from "zod"

// Agent validation schema
export const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Name is too long"),
  role: z.string().min(1, "Role is required").max(100, "Role is too long"),
  goal: z.string().min(10, "Goal must be at least 10 characters").max(500, "Goal is too long"),
  backstory: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(100).max(8000),
  tools: z.array(z.string()),
  status: z.enum(["active", "idle", "disabled"]),
})

export type AgentFormData = z.infer<typeof agentSchema>

// Task validation schema
export const taskSchema = z.object({
  name: z.string().min(1, "Task name is required").max(100, "Name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  agent: z.string().min(1, "Agent assignment is required"),
  expectedOutput: z.string().min(10, "Expected output must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["pending", "in-progress", "completed", "failed"]),
  dependencies: z.array(z.string()),
  context: z.array(z.string()),
  order: z.number().min(0),
})

export type TaskFormData = z.infer<typeof taskSchema>

// Workflow validation schema
export const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  agent_ids: z.array(z.string()),
  task_ids: z.array(z.string()).min(1, "At least one task is required"),
  status: z.enum(["draft", "active", "paused", "completed", "failed"]),
})

export type WorkflowFormData = z.infer<typeof workflowSchema>

// Integration validation schema
export const integrationSchema = z.object({
  name: z.string().min(1, "Integration name is required").max(100, "Name is too long"),
  type: z.enum(["api", "database", "webhook", "storage"]),
  config: z.record(z.any()),
  credentials: z.record(z.any()).optional(),
  enabled: z.boolean(),
})

export type IntegrationFormData = z.infer<typeof integrationSchema>
