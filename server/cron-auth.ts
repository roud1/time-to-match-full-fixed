/** Authorize Vercel Cron / external schedulers for /api/v1/cron/* routes. */
export function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const dbConfigured = Boolean(process.env.DATABASE_URL?.trim())

  if (!secret) {
    if (dbConfigured) return false
    return process.env.NODE_ENV === "development"
  }

  const header = request.headers.get("authorization")
  if (header === `Bearer ${secret}`) return true
  return request.headers.get("x-cron-secret") === secret
}
