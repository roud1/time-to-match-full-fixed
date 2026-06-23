/** PostgreSQL pool defaults (used by server/db). */
export function defaultDatabasePoolMax(): number {
  const configured = process.env.DATABASE_POOL_MAX?.trim()
  if (configured) return Number(configured)
  if (process.env.VERCEL === "1") return 5
  return 10
}
