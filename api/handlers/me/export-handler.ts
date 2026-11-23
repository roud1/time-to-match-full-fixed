/**
 * GET /api/me/export — GDPR right of access / data portability (Art. 15, 20).
 *
 * Returns everything stored about the signed-in user as one JSON file: account, profile,
 * computed matching scores, interests, photos, likes given, matches, messages they sent,
 * blocks and reports they made, subscription, notifications, verification requests,
 * analytics/behaviour events and synced app state.
 *
 * Other people's personal data is not exported: received likes are a count only, and only
 * messages the user sent are included. Secrets (password hash, push subscription keys,
 * payment provider ids) are left out.
 */

import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import { getDb } from "@/server/db"
import { log } from "@/server/log"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

type Sql = NonNullable<ReturnType<typeof getDb>>

/** One section; a missing table (older schema) yields null instead of failing the whole export. */
async function section<T>(name: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run()
  } catch (err) {
    log.warn("data_export_section_failed", { section: name, err: err instanceof Error ? err.message : String(err) })
    return null
  }
}

async function collect(sql: Sql, uid: string) {
  const [account] = await sql`
    SELECT id, email, name, created_at, email_verified, role, last_active_at, profile_expires_at,
           freeze_balance, last_freeze_at, is_active, photo_verified
    FROM users WHERE id = ${uid}
  `
  if (!account) return null

  return {
    exportedAt: new Date().toISOString(),
    service: "Luvia",
    account,
    profile: await section("profile", async () => {
      const [row] = await sql`
        SELECT profile, bio, birth_date, gender, purpose, age_min, age_max, max_distance,
               location_city, location_country, latitude, longitude, location_updated_at,
               discover_visibility, boost_expires_at
        FROM users WHERE id = ${uid}
      `
      return row ?? null
    }),
    // Scores the service computes about the user (profiling, GDPR Art. 15(1)(h)).
    computedScores: await section("computedScores", async () => {
      const [row] = await sql`
        SELECT behavior_score, response_time_avg_ms, ignore_rate, activity_score, conversation_depth,
               ranking_tier, matches_total, matches_expired_as_ghost, messages_sent_7d, last_behavior_at
        FROM users WHERE id = ${uid}
      `
      return row ?? null
    }),
    interests: await section("interests", () =>
      sql`SELECT i.name, i.slug FROM user_interests ui JOIN interests i ON i.id = ui.interest_id WHERE ui.user_id = ${uid}`
    ),
    photos: await section("photos", () =>
      sql`SELECT url, position, is_primary, created_at FROM user_photos WHERE user_id = ${uid} ORDER BY position`
    ),
    likesGiven: await section("likesGiven", () =>
      sql`SELECT to_user, created_at, is_super, is_match, is_expired FROM likes WHERE from_user = ${uid} ORDER BY created_at`
    ),
    likesReceivedCount: await section("likesReceivedCount", async () => {
      const [row] = await sql`SELECT count(*)::int AS count FROM likes WHERE to_user = ${uid}`
      return row?.count ?? 0
    }),
    matches: await section("matches", () =>
      sql`
        SELECT id, CASE WHEN user1_id = ${uid} THEN user2_id ELSE user1_id END AS other_user_id,
               created_at, expires_at, expired_at, status, first_message_at
        FROM matches WHERE user1_id = ${uid} OR user2_id = ${uid} ORDER BY created_at
      `
    ),
    messagesSentInMatches: await section("messagesSentInMatches", () =>
      sql`SELECT match_id, body, created_at FROM match_messages WHERE sender_id = ${uid} ORDER BY created_at`
    ),
    messagesSentInConversations: await section("messagesSentInConversations", () =>
      sql`SELECT conversation_id, body, created_at FROM messages WHERE sender_id = ${uid} ORDER BY created_at`
    ),
    blocks: await section("blocks", () =>
      sql`SELECT blocked_id, created_at FROM user_blocks WHERE blocker_id = ${uid} ORDER BY created_at`
    ),
    reportsMade: await section("reportsMade", () =>
      sql`SELECT reported_user_id, reason, comment, status, created_at FROM reports WHERE reporter_id = ${uid} ORDER BY created_at`
    ),
    subscription: await section("subscription", () =>
      sql`SELECT plan, status, current_period_end, premium_until, created_at, updated_at FROM user_subscriptions WHERE user_id = ${uid}`
    ),
    notifications: await section("notifications", () =>
      sql`SELECT type, scheduled_for, sent, read, sent_at, created_at FROM notifications WHERE user_id = ${uid} ORDER BY created_at`
    ),
    verificationRequests: await section("verificationRequests", () =>
      sql`SELECT gesture, selfie_url, status, created_at, reviewed_at FROM verification_requests WHERE user_id = ${uid} ORDER BY created_at`
    ),
    analyticsEvents: await section("analyticsEvents", () =>
      sql`SELECT event, properties, created_at FROM analytics_events WHERE user_id = ${uid} ORDER BY created_at`
    ),
    behaviourEvents: await section("behaviourEvents", () =>
      sql`SELECT event_type, value_num, meta, created_at FROM user_behavior_events WHERE user_id = ${uid} ORDER BY created_at`
    ),
    appState: await section("appState", () =>
      sql`SELECT connections_json, updated_at FROM user_app_state WHERE user_id = ${uid}`
    ),
  }
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" }))
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const rl = await checkRateLimit(`me:export:${session.sub}`, 5, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(request, jsonError(429, { error: "rate_limited", message: "Too many exports, try again later" }))
  }

  const db = getDb()
  if (!db) {
    return withCors(request, jsonError(503, { error: "db_unavailable", message: "Database unavailable" }))
  }

  const data = await collect(db, session.sub)
  if (!data) {
    return withCors(request, jsonError(404, { error: "user_not_found", message: "User not found" }))
  }

  log.info("data_export", { userId: session.sub })
  const date = new Date().toISOString().slice(0, 10)
  const res = new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="luvia-data-${date}.json"`,
      "Cache-Control": "no-store",
    },
  })
  return withCors(request, res)
}
