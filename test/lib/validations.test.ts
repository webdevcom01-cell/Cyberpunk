import { describe, it, expect } from "vitest"
import { agentSchema, taskSchema, workflowSchema } from "@/lib/validations"

describe("Validation Schemas", () => {
  describe("agentSchema", () => {
    it("should validate a valid agent", () => {
      const validAgent = {
        name: "Test Agent",
        role: "Developer",
        goal: "Build amazing features",
        backstory: "Expert developer",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
        tools: ["web_search"],
        status: "active" as const,
      }

      const result = agentSchema.safeParse(validAgent)
      expect(result.success).toBe(true)
    })

    it("should fail with missing required fields", () => {
      const invalidAgent = {
        name: "",
        role: "Developer",
      }

      const result = agentSchema.safeParse(invalidAgent)
      expect(result.success).toBe(false)
    })

    it("should fail with invalid temperature", () => {
      const invalidAgent = {
        name: "Test Agent",
        role: "Developer",
        goal: "Build features",
        model: "gpt-4",
        temperature: 2.0, // Invalid: > 1
        maxTokens: 2000,
        tools: [],
        status: "active" as const,
      }

      const result = agentSchema.safeParse(invalidAgent)
      expect(result.success).toBe(false)
    })
  })

  describe("taskSchema", () => {
    it("should validate a valid task", () => {
      const validTask = {
        name: "Test Task",
        description: "Test description with enough characters",
        agent: "agent-id",
        expectedOutput: "Expected output description",
        priority: "medium" as const,
        status: "pending" as const,
        dependencies: [],
        context: [],
        order: 0,
      }

      const result = taskSchema.safeParse(validTask)
      expect(result.success).toBe(true)
    })

    it("should fail with short description", () => {
      const invalidTask = {
        name: "Test Task",
        description: "Short",
        agent: "agent-id",
        expectedOutput: "Output",
        priority: "medium" as const,
        status: "pending" as const,
        dependencies: [],
        context: [],
        order: 0,
      }

      const result = taskSchema.safeParse(invalidTask)
      expect(result.success).toBe(false)
    })
  })

  describe("workflowSchema", () => {
    it("should validate a valid workflow", () => {
      const validWorkflow = {
        name: "Test Workflow",
        description: "Test description",
        agent_ids: ["agent-1"],
        task_ids: ["task-1"],
        status: "draft" as const,
      }

      const result = workflowSchema.safeParse(validWorkflow)
      expect(result.success).toBe(true)
    })

    it("should fail without tasks", () => {
      const invalidWorkflow = {
        name: "Test Workflow",
        agent_ids: [],
        task_ids: [], // Empty array
        status: "draft" as const,
      }

      const result = workflowSchema.safeParse(invalidWorkflow)
      expect(result.success).toBe(false)
    })
  })
})
