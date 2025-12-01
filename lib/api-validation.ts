// Server-side API validation utilities
import { z } from "zod"
import { NextResponse } from "next/server"

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string> }

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      return {
        success: false,
        error: "Validation failed",
        errors: fieldErrors,
      }
    }
    return {
      success: false,
      error: "Invalid request data",
    }
  }
}

export function validationErrorResponse(result: ValidationResult<never>) {
  if (result.success) return null

  return NextResponse.json(
    {
      error: result.error,
      errors: result.errors,
    },
    { status: 400 },
  )
}

// Common validation schemas for API
export const idSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  ...paginationSchema.shape,
})
