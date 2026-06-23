import postgres from "postgres"
import { getServerEnv } from "@/config/env"
import { defaultDatabasePoolMax } from "@/config/database"
import { log } from "@/server/log"

let sql: ReturnType<typeof postgres> | null = null


/** Node.js SQL client (postgres.js). Returns null when DATABASE_URL is unset — demo mode. */
export function getDb() {
  const { DATABASE_URL, isDatabaseConfigured } = getServerEnv()
  if (!isDatabaseConfigured || !DATABASE_URL) return null
  if (!sql) {
    sql = postgres(DATABASE_URL, {
      max: defaultDatabasePoolMax(),
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      onnotice: (n) => log.debug("postgres_notice", { message: n.message }),
    })
  }
  return sql
}

export async function dbHealthCheck(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const client = getDb()
  if (!client) return { ok: false, error: "database_not_configured" }
  const t0 = Date.now()
  try {
    await client`SELECT 1 AS ok`
    return { ok: true, latencyMs: Date.now() - t0 }
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown_error"
    return { ok: false, error: message }
  }
}
