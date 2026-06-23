import { getDb } from "@/server/db"
import { log } from "@/server/log"

export async function runDbCleanup(): Promise<{ deletedUsers: number; deletedMessages: number }> {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")

  const deletedUsers = await db<{ id: string }[]>`
    DELETE FROM users
    WHERE profile_expires_at IS NOT NULL AND profile_expires_at < now()
    RETURNING id
  `
  const deletedMsgs = await db<{ id: string }[]>`
    DELETE FROM messages
    WHERE expires_at IS NOT NULL AND expires_at < now()
    RETURNING id
  `

  const result = { deletedUsers: deletedUsers.length, deletedMessages: deletedMsgs.length }
  log.info("db_cleanup_done", result)
  return result
}
