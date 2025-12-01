// Environment variable validation and type-safe access

const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const

const optionalEnvVars = [
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX_REQUESTS",
  "CORS_ORIGIN",
  "VERCEL_ANALYTICS_ID",
  "SENTRY_DSN",
] as const

export function validateEnv() {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\n` +
        "Please copy .env.example to .env and fill in the values.\n" +
        "See ENV_SETUP.md for detailed instructions.",
    )
  }
}

export const env = {
  // Public variables (available in browser)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  features: {
    enableAI: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === "true",
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    enableRealtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME !== "false",
  },

  // Server-only variables
  ...(typeof window === "undefined" && {
    database: {
      url: process.env.DATABASE_URL,
      postgresUrl: process.env.POSTGRES_URL,
    },
    ai: {
      geminiKey: process.env.GEMINI_API_KEY,
      openaiKey: process.env.OPENAI_API_KEY,
      anthropicKey: process.env.ANTHROPIC_API_KEY,
    },
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    },
    rateLimit: {
      windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
      maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    },
  }),
} as const

// Validate on startup (server-side only)
if (typeof window === "undefined") {
  try {
    validateEnv()
  } catch (error) {
    console.error(error)
    // Don't throw in development to allow hot reload
    if (process.env.NODE_ENV === "production") {
      process.exit(1)
    }
  }
}
