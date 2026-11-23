import { getDb } from "@/server/db"
import { log } from "@/server/log"

/**
 * Periodic cleanup. It must NOT delete accounts: profile_expires_at is the 72-hour feed visibility
 * window (an inactive profile is only hidden until the user comes back), not an account lifetime.
 * Account deletion happens only on the user's request (DELETE /api/me) or under a documented
 * retention policy (not implemented yet).
 */
export async function runDbCleanup(): Promise<{ deletedUsers: number; deletedMessages: number }> {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")

  const deletedMsgs = await db<{ id: string }[]>`
    DELETE FROM messages
    WHERE expires_at IS NOT NULL AND expires_at < now()
    RETURNING id
  `

  const result = { deletedUsers: 0, deletedMessages: deletedMsgs.length }
  log.info("db_cleanup_done", result)
  return result
}
