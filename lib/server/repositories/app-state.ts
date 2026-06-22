import { getDb } from "@/lib/server/db"

export type AppStatePayload = {
  version: number
  connections: unknown[]
  memories: unknown[]
  recentEvents: unknown[]
  savedAt?: number
}

const DEFAULT: AppStatePayload = {
  version: 1,
  connections: [],
  memories: [],
  recentEvents: [],
}

export async function getUserAppState(userId: string): Promise<AppStatePayload | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<{ connections_json: AppStatePayload; updated_at: Date }[]>`
    SELECT connections_json, updated_at FROM user_app_state WHERE user_id = ${userId}::uuid LIMIT 1
  `
  if (!rows.length) return null
  const raw = rows[0].connections_json
  return {
    ...DEFAULT,
    ...(typeof raw === "object" && raw !== null ? raw : {}),
    savedAt: rows[0].updated_at.getTime(),
  }
}

export async function upsertUserAppState(userId: string, payload: AppStatePayload): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const body = { ...payload, savedAt: Date.now() }
  await db`
    INSERT INTO user_app_state (user_id, connections_json, updated_at)
    VALUES (${userId}::uuid, ${db.json(JSON.parse(JSON.stringify(body)))}, now())
    ON CONFLICT (user_id) DO UPDATE SET
      connections_json = EXCLUDED.connections_json,
      updated_at = now()
  `
  return true
}
