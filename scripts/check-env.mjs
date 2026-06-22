#!/usr/bin/env node
/**
 * Validates environment for production / server mode.
 * Exit 0 = ok (warnings allowed); exit 1 = errors when --strict.
 *
 * Usage:
 *   node scripts/check-env.mjs
 *   node scripts/check-env.mjs --strict
 */
const strict = process.argv.includes("--strict")

function isProductionHost() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.RENDER === "true"
  )
}

function collectIssues() {
  const issues = []
  const hosted = isProductionHost()
  const databaseUrl = process.env.DATABASE_URL?.trim()
  const authSecret = process.env.AUTH_SECRET?.trim()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!databaseUrl) {
    if (hosted) {
      issues.push({
        variable: "DATABASE_URL",
        severity: "error",
        message: "Required on hosted production — app runs in demo mode without it.",
      })
    } else {
      console.log("Mode: demo (DATABASE_URL unset)")
    }
    return issues
  }

  console.log("Mode: production (DATABASE_URL set)")

  if (!authSecret) {
    issues.push({
      variable: "AUTH_SECRET",
      severity: "error",
      message: "Required when DATABASE_URL is set.",
    })
  } else if (hosted && authSecret.length < 32) {
    issues.push({
      variable: "AUTH_SECRET",
      severity: "warning",
      message: "Use at least 32 characters (openssl rand -base64 32).",
    })
  }

  if (hosted && !appUrl) {
    issues.push({
      variable: "NEXT_PUBLIC_APP_URL",
      severity: "error",
      message: "Required in production for metadata, OG, sitemap, PWA.",
    })
  } else if (hosted && appUrl && !/^https:\/\//i.test(appUrl)) {
    issues.push({
      variable: "NEXT_PUBLIC_APP_URL",
      severity: "warning",
      message: "Use an https:// URL in production.",
    })
  }

  if (hosted && !cronSecret) {
    issues.push({
      variable: "CRON_SECRET",
      severity: "warning",
      message: "Required for /api/v1/cron/* on Vercel and external schedulers.",
    })
  }

  return issues
}

const issues = collectIssues()
let errors = 0
let warnings = 0

for (const issue of issues) {
  const tag = issue.severity === "error" ? "ERROR" : "WARN"
  console.log(`[check-env] ${tag}: ${issue.variable} — ${issue.message}`)
  if (issue.severity === "error") errors++
  else warnings++
}

if (!issues.length) {
  console.log("[check-env] All required production variables look good.")
}

if (errors > 0 && strict) {
  console.error(`[check-env] ${errors} error(s) — fix before deploy (or unset --strict for warnings only).`)
  process.exit(1)
}

if (errors > 0 && !strict) {
  console.log(`[check-env] ${errors} error(s) found (run with --strict to fail CI).`)
}

process.exit(0)
