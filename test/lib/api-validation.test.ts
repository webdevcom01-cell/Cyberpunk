import { describe, it, expect } from "vitest"
import { z } from "zod"
import { validateRequest } from "@/lib/api-validation"

describe("API Validation", () => {
  const testSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(18),
  })

  it("should validate correct data", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    }

    const result = validateRequest(testSchema, validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it("should return errors for invalid data", () => {
    const invalidData = {
      name: "",
      email: "not-an-email",
      age: 15,
    }

    const result = validateRequest(testSchema, invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
      expect(result.errors?.name).toBeDefined()
      expect(result.errors?.email).toBeDefined()
      expect(result.errors?.age).toBeDefined()
    }
  })

  it("should handle missing fields", () => {
    const invalidData = {
      name: "John",
    }

    const result = validateRequest(testSchema, invalidData)
    expect(result.success).toBe(false)
  })
})
