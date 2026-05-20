#!/usr/bin/env node
/**
 * Periodic maintenance: expired profiles and expired messages.
 * Schedule on Render/cron: node scripts/db-cleanup.mjs
 */
import postgres from "postgres"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const sql = postgres(url, { max: 1 })

try {
  const deletedUsers = await sql`
    DELETE FROM users
    WHERE profile_expires_at IS NOT NULL AND profile_expires_at < now()
    RETURNING id
  `
  const deletedMsgs = await sql`
    DELETE FROM messages
    WHERE expires_at IS NOT NULL AND expires_at < now()
    RETURNING id
  `
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      deletedUsers: deletedUsers.length,
      deletedMessages: deletedMsgs.length,
    })
  )
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
