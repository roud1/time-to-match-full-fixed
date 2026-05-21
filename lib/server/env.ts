import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  /** HS256 secret for httpOnly session JWT (min 32 chars recommended for production). */
  AUTH_SECRET: z.string().min(16).optional(),
  /** Optional: comma-separated origins for CORS on /api/v1 (default same-origin). */
  CORS_ORIGINS: z.string().optional(),
  /** OpenRouter — all server AI (connection + Pulse). Never expose to client. */
  OPENROUTER_API_KEY: z.string().min(8).optional(),
  OPENROUTER_MODEL: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  isDatabaseConfigured: boolean
  isAuthConfigured: boolean
  isOpenRouterConfigured: boolean
}

let cached: ServerEnv | null = null

export function getServerEnv(): ServerEnv {
  if (cached) return cached
  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    console.warn("[ttm/env] Invalid environment variables:", parsed.error.flatten().fieldErrors)
  }
  const data = parsed.success ? parsed.data : {}
  cached = {
    ...data,
    isDatabaseConfigured: Boolean(data.DATABASE_URL),
    isAuthConfigured: Boolean(data.AUTH_SECRET && data.DATABASE_URL),
    isOpenRouterConfigured: Boolean(data.OPENROUTER_API_KEY && data.OPENROUTER_API_KEY.length > 8),
  }
  if (data.NODE_ENV === "production" && data.AUTH_SECRET && data.AUTH_SECRET.length < 32) {
    console.warn("[ttm/env] AUTH_SECRET should be at least 32 characters in production.")
  }
  return cached
}

export function resetServerEnvCache() {
  cached = null
}
