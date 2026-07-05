/** Authorize Vercel Cron / external schedulers for /api/v1/cron/* routes. */
export function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  const isProd = process.env.NODE_ENV === "production"

  // In production: CRON_SECRET is mandatory — no secret = no access
  if (!secret) {
    if (isProd) {
      // Log loudly so it shows up in Vercel logs
      console.error("[cron-auth] CRON_SECRET is not set. All cron requests denied in production.")
      return false
    }
    // Dev only: allow without secret when there's no DB (local testing)
    const dbConfigured = Boolean(process.env.DATABASE_URL?.trim())
    return !dbConfigured
  }

  const header = request.headers.get("authorization")
  if (header === `Bearer ${secret}`) return true
  return request.headers.get("x-cron-secret") === secret
}
