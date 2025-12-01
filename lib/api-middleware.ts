// API middleware for rate limiting and error handling
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

export function withRateLimit(handler: (request: Request) => Promise<NextResponse>, maxRequests = 100) {
  return async (request: Request) => {
    // Get identifier (IP or user ID)
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"

    const result = rateLimit(ip, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // Add rate limit headers to response
    const response = await handler(request)
    response.headers.set("X-RateLimit-Limit", result.limit.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.reset.toString())

    return response
  }
}

export function withErrorHandler(handler: (request: Request) => Promise<NextResponse>) {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      console.error("[API Error]:", error)

      return NextResponse.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  }
}
