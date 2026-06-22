import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  /** HS256 secret for httpOnly session JWT (min 32 chars recommended for production). */
  AUTH_SECRET: z.string().min(16).optional(),
  /** Optional: comma-separated origins for CORS on /api/v1 (default same-origin). */
  CORS_ORIGINS: z.string().optional(),
  /** OpenRouter — server AI for connection analysis. Never expose to client. */
  OPENROUTER_API_KEY: z.string().min(8).optional(),
  OPENROUTER_MODEL: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  CRON_SECRET: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  isDatabaseConfigured: boolean
  isAuthConfigured: boolean
  isOpenRouterConfigured: boolean
}

export type ProductionEnvIssue = {
  variable: string
  severity: "error" | "warning"
  message: string
}

let cached: ServerEnv | null = null
let validationLogged = false

function isProductionHost(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.RENDER === "true"
  )
}

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
  return cached
}

/** Issues when DATABASE_URL is set (server mode) or NODE_ENV=production (hosted deploy). */
export function getProductionEnvIssues(): ProductionEnvIssue[] {
  const env = getServerEnv()
  const issues: ProductionEnvIssue[] = []
  const hosted = isProductionHost()

  if (!env.isDatabaseConfigured) {
    if (hosted) {
      issues.push({
        variable: "DATABASE_URL",
        severity: "error",
        message: "Required on hosted production — app runs in demo mode without it.",
      })
    }
    return issues
  }

  if (!env.AUTH_SECRET) {
    issues.push({
      variable: "AUTH_SECRET",
      severity: "error",
      message: "Required when DATABASE_URL is set (server auth disabled without it).",
    })
  } else if (hosted && env.AUTH_SECRET.length < 32) {
    issues.push({
      variable: "AUTH_SECRET",
      severity: "warning",
      message: "Use at least 32 characters in production (openssl rand -base64 32).",
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (hosted && !appUrl) {
    issues.push({
      variable: "NEXT_PUBLIC_APP_URL",
      severity: "error",
      message: "Required in production for metadata, OG tags, sitemap, and PWA.",
    })
  } else if (hosted && appUrl && !/^https:\/\//i.test(appUrl)) {
    issues.push({
      variable: "NEXT_PUBLIC_APP_URL",
      severity: "warning",
      message: "Use an https:// URL in production.",
    })
  }

  if (hosted && !env.CRON_SECRET) {
    issues.push({
      variable: "CRON_SECRET",
      severity: "warning",
      message: "Required for /api/v1/cron/* (Vercel Cron sends Authorization: Bearer …).",
    })
  }

  return issues
}

/** Log env issues once at startup. Set TTM_STRICT_ENV=1 to exit on errors. */
export function validateProductionEnv(): ProductionEnvIssue[] {
  const issues = getProductionEnvIssues()
  if (validationLogged) return issues
  validationLogged = true

  for (const issue of issues) {
    const tag = issue.severity === "error" ? "ERROR" : "WARN"
    console.warn(`[ttm/env] ${tag}: ${issue.variable} — ${issue.message}`)
  }

  if (process.env.TTM_STRICT_ENV === "1" && issues.some((i) => i.severity === "error")) {
    console.error("[ttm/env] TTM_STRICT_ENV=1 — refusing to start with missing required variables.")
    process.exit(1)
  }

  return issues
}

export function resetServerEnvCache() {
  cached = null
  validationLogged = false
}
