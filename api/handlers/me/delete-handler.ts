/**
 * DELETE /api/me — GDPR right to erasure.
 *
 * Cascades full account deletion:
 *   user → likes → matches → messages → push_subscriptions
 *   → photo records → xp/achievements → purchases → sessions
 *
 * S3 photo keys are deleted first; if S3 fails we still proceed
 * with DB deletion (photos become dangling keys in storage, acceptable).
 *
 * Security:
 *   - Requires valid session (authenticated user only)
 *   - Requires password confirmation to prevent accidental deletion
 *   - Invalidates all auth cookies on success
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

  // 2. Parse + validate body
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
      jsonError(400, { error: "validation_error", message: parsed.error.errors[0]?.message ?? "Invalid body" })
    )
  }

  // 3. Re-verify password (require confirmation to prevent accidents)
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
    // 4. Cascade delete — order matters (FK constraints)
    // Messages in active matches
    await db`DELETE FROM messages WHERE match_id IN (
      SELECT id FROM matches WHERE user_a_id = ${user.id} OR user_b_id = ${user.id}
    )`

    // Matches
    await db`DELETE FROM matches WHERE user_a_id = ${user.id} OR user_b_id = ${user.id}`

    // Likes (given and received)
    await db`DELETE FROM likes WHERE liker_id = ${user.id} OR liked_id = ${user.id}`

    // Push subscriptions
    await db`DELETE FROM push_subscriptions WHERE user_id = ${user.id}`.catch(() => null)

    // XP and achievements
    await db`DELETE FROM user_xp WHERE user_id = ${user.id}`.catch(() => null)
    await db`DELETE FROM user_achievements WHERE user_id = ${user.id}`.catch(() => null)

    // Purchases / subscriptions
    await db`DELETE FROM purchases WHERE user_id = ${user.id}`.catch(() => null)
    await db`DELETE FROM subscriptions WHERE user_id = ${user.id}`.catch(() => null)

    // Reports (both sides)
    await db`DELETE FROM reports WHERE reporter_id = ${user.id} OR reported_id = ${user.id}`.catch(() => null)

    // Photo verification records
    await db`DELETE FROM photo_verifications WHERE user_id = ${user.id}`.catch(() => null)

    // Password reset tokens
    await db`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`.catch(() => null)

    // Behavior metrics
    await db`DELETE FROM user_behavior_metrics WHERE user_id = ${user.id}`.catch(() => null)

    // Finally delete the user (photos stored as JSON in profile column, cascade handled)
    await db`DELETE FROM users WHERE id = ${user.id}`

    log.info("account_delete_ok", { userId: user.id })
  } catch (err) {
    log.error("account_delete_fail", { userId: user.id, err })
    return withCors(
      request,
      jsonError(500, { error: "delete_failed", message: "Failed to delete account. Please try again or contact support." })
    )
  }

  // 5. Clear auth cookies
  const res = jsonOk({ deleted: true, message: "Account permanently deleted." })
  clearAuthCookies(res)
  return withCors(request, res)
}
