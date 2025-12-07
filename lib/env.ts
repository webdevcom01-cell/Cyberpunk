import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Optional on client

  // Security
  JWT_SECRET: z.string().min(32).optional(), // Optional for now as we use Supabase
  CORS_ORIGIN: z.string().url().optional().default('http://localhost:3000'),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
})

// Validate process.env
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors)
  // Only throw in production build to prevent dev crashes if optional vars missing
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment variables')
  }
}

export const env = parsedEnv.success ? parsedEnv.data : process.env as unknown as z.infer<typeof envSchema>
