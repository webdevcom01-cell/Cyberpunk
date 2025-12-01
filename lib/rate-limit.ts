// Simple in-memory rate limiter
// For production, use Redis or a dedicated service

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
): RateLimitResult {
  const now = Date.now()
  const record = store[identifier]

  // First request or window expired
  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: store[identifier].resetTime,
    }
  }

  // Within window
  if (record.count < config.maxRequests) {
    record.count++
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.count,
      reset: record.resetTime,
    }
  }

  // Rate limit exceeded
  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    reset: record.resetTime,
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}, 60 * 1000) // Clean up every minute
