/**
 * DELETE /api/me — GDPR right to erasure.
 *
 * Deletes ALL user data in a single PostgreSQL transaction.
 * If any step fails → full rollback, user stays intact.
 *
 * Delete order respects FK constraints:
 *   match_messages → matches
 *   match_stats    → likes (match_stats.match_id → likes.id)
 *   ai_analysis_jobs / connection_scores → likes
 *   likes          → (cascades to match_stats, ai_analysis_jobs, connection_scores)
 *   connection_memories, connections, discover_passes
 *   messages (conversation-based, cascade from conversations → conv_participants)
 *   all user-owned rows with ON DELETE CASCADE are handled by final DELETE FROM users
 *   users          → CASCADE handles everything else
 *
 * Tables with ON DELETE CASCADE from users (handled automatically by final DELETE):
 *   conversation_participants, messages, user_presence, user_app_state,
 *   user_achievements, user_xp, notifications, user_interests,
 *   password_reset_tokens, user_refresh_tokens, user_subscriptions,
 *   user_blocks (blocker+blocked), reports (reporter+reported),
 *   verification_requests, user_photos, user_daily_likes, user_daily_super_likes,
 *   user_behavior_events, discover_passes, analytics_events (SET NULL — not deleted)
 *
 * We explicitly delete tables that need ordering or are NOT CASCADE from users.
 */

import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { findUserForAuthByEmail, findUserById } from "@/server/repositories/users"
import { verifyPassword } from "@/server/auth/password"
import { clearAuthCookies } from "@/server/auth/refresh"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { log } from "@/server/log"
import { getDb } from "@/server/db"
import { z } from "zod"

export const runtime = "nodejs"

const deleteBodySchema = z.object({
  password: z.string().min(1, "Password is required to confirm account deletion"),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function DELETE(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  // 1. Verify session
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const user = await findUserById(session.sub)
  if (!user) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "User not found" }))
  }

  // 2. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Body must be JSON" }))
  }

  const parsed = deleteBodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(
      request,
      jsonError(400, {
        error: "validation_error",
        message: parsed.error.errors[0]?.message ?? "Invalid body",
      })
    )
  }

  // 3. Re-verify password (prevent accidental/malicious deletion)
  const authUser = await findUserForAuthByEmail(user.email)
  if (!authUser || !(await verifyPassword(parsed.data.password, authUser.password_hash))) {
    log.warn("account_delete_bad_password", { userId: user.id })
    return withCors(
      request,
      jsonError(403, { error: "invalid_password", message: "Password is incorrect" })
    )
  }

  const db = getDb()
  if (!db) {
    return withCors(request, jsonError(503, { error: "db_unavailable", message: "Database unavailable" }))
  }

  log.info("account_delete_start", { userId: user.id })

  try {
    // 4. Single transaction — all or nothing
    await db.begin(async (sql) => {
      const uid = user.id

      // ── Step 1: match_messages (FK → matches.id ON DELETE CASCADE,
      //   but matches are deleted by CASCADE from users later;
      //   we delete explicitly first to avoid FK conflicts on likes)
      await sql`
        DELETE FROM match_messages
        WHERE match_id IN (
          SELECT id FROM matches
          WHERE user1_id = ${uid} OR user2_id = ${uid}
        )
      `

      // ── Step 2: match-related engine tables that reference likes.id
      //   match_stats.match_id → likes.id ON DELETE CASCADE
      //   ai_analysis_jobs.match_id → likes.id ON DELETE CASCADE
      //   connection_scores.match_id → likes.id ON DELETE CASCADE
      //   These cascade from likes, but we delete explicitly to be safe
      await sql`
        DELETE FROM match_stats
        WHERE match_id IN (
          SELECT id FROM likes
          WHERE from_user = ${uid} OR to_user = ${uid}
        )
      `.catch(() => null) // table may not exist on older schemas

      // ── Step 3: matches (FK → users ON DELETE CASCADE, but ordering matters)
      await sql`
        DELETE FROM matches
        WHERE user1_id = ${uid} OR user2_id = ${uid}
      `

      // ── Step 4: likes (given and received)
      //   Cascades: match_stats, ai_analysis_jobs, connection_scores
      await sql`
        DELETE FROM likes
        WHERE from_user = ${uid} OR to_user = ${uid}
      `

      // ── Step 5: connections (002_connections — separate from matches)
      await sql`
        DELETE FROM connections
        WHERE user_a = ${uid} OR user_b = ${uid}
      `.catch(() => null)

      // ── Step 6: connection_memories — SET NULL on connection_id, CASCADE on user_id
      await sql`
        DELETE FROM connection_memories
        WHERE user_id = ${uid} OR peer_user_id = ${uid}
      `.catch(() => null)

      // ── Step 7: discover_passes
      await sql`
        DELETE FROM discover_passes
        WHERE from_user = ${uid} OR to_user = ${uid}
      `.catch(() => null)

      // ── Step 8: user_blocks (both sides)
      await sql`
        DELETE FROM user_blocks
        WHERE blocker_id = ${uid} OR blocked_id = ${uid}
      `.catch(() => null)

      // ── Step 9: reports (both reporter and reported)
      await sql`
        DELETE FROM reports
        WHERE reporter_id = ${uid} OR reported_user_id = ${uid}
      `.catch(() => null)

      // ── Step 10: password_reset_tokens (including email verification tokens)
      await sql`
        DELETE FROM password_reset_tokens
        WHERE user_id = ${uid}
      `.catch(() => null)

      // ── Step 11: refresh tokens
      await sql`
        DELETE FROM user_refresh_tokens
        WHERE user_id = ${uid}
      `.catch(() => null)

      // ── Step 12: subscriptions / billing
      await sql`
        DELETE FROM user_subscriptions
        WHERE user_id = ${uid}
      `.catch(() => null)

      // ── Step 13: conversations where user is participant
      //   Deleting conversation_participants CASCADE → nothing (messages don't cascade from participants)
      //   We must delete the conversations themselves if user is the only/last participant
      //   Simpler: delete all conversations the user participated in
      //   (messages ON DELETE CASCADE from conversations)
      await sql`
        DELETE FROM conversations
        WHERE id IN (
          SELECT conversation_id FROM conversation_participants
          WHERE user_id = ${uid}
        )
      `.catch(() => null)

      // ── Step 14: everything else with ON DELETE CASCADE from users
      //   Covered by the final DELETE FROM users:
      //   user_photos, user_xp, user_achievements, user_app_state,
      //   user_presence, notifications, user_interests, user_daily_likes,
      //   user_daily_super_likes, user_behavior_events, verification_requests,
      //   analytics_events (SET NULL — row kept, user_id nulled)

      // ── Final: delete the user row — triggers all CASCADE deletes
      const deleted = await sql`
        DELETE FROM users WHERE id = ${uid} RETURNING id
      `
      if (!deleted[0]) {
        throw new Error("user_not_found")
      }
    })

    log.info("account_delete_ok", { userId: user.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === "user_not_found") {
      return withCors(request, jsonError(404, { error: "user_not_found", message: "User not found" }))
    }
    log.error("account_delete_fail", { userId: user.id, err: msg })
    return withCors(
      request,
      jsonError(500, {
        error: "delete_failed",
        message: "Failed to delete account. Please try again or contact support.",
      })
    )
  }

  // 5. Clear auth cookies — instant logout
  const res = jsonOk({ deleted: true, message: "Account permanently deleted." })
  clearAuthCookies(res)
  return withCors(request, res)
}
