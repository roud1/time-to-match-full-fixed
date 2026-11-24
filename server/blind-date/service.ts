/**
 * Blind Date service: eligibility, queue + matchmaking, server-authoritative rooms,
 * messages, mutual reveal consent, decisions (→ existing match + 24 h timer), leave, report.
 *
 * Concurrency: matchmaking runs under a transaction-scoped advisory lock; partial unique
 * indexes allow one open room per user; room transitions use conditional UPDATEs so only one
 * request performs a transition (e.g. creating the match).
 */

import { getDb } from "@/server/db"
import { log } from "@/server/log"
import { trackServerEvent } from "@/server/analytics/track"
import { isPremium } from "@/server/monetization/subscription.service"
import { blockUserPair, mapReportReasonKey } from "@/server/repositories/moderation"
import {
  DECISION_WINDOW_MS,
  QUEUE_STALE_MS,
  REMATCH_COOLDOWN_DAYS,
  ROOM_DURATION_MS,
  ageFrom,
  checkMessage,
  connectionProgress,
  firstName,
  freeDailyDates,
  outcomeFor,
  phaseAt,
  stageForProgress,
  visibleRevealStage,
  type CloseReason,
  type Decision,
  type RevealStage,
  type RoomStatus,
} from "@/server/blind-date/rules"

type Sql = NonNullable<ReturnType<typeof getDb>>

const MATCHMAKING_LOCK = 774_210_031

export type RoomRow = {
  id: string
  user_a: string
  user_b: string
  status: RoomStatus
  started_at: Date
  ends_at: Date
  decide_until: Date
  closed_at: Date | null
  close_reason: CloseReason | null
  closed_by: string | null
  reveal_consent_a: boolean
  reveal_consent_b: boolean
  reveal_level: number
  decision_a: Decision | null
  decision_b: Decision | null
  match_id: string | null
  version: number
}

export type Ineligible =
  | "not_found"
  | "blocked_account"
  | "age_unknown"
  | "under_18"
  | "consent_required"
  | "daily_limit"

export type QueueStatus =
  | { state: "idle" }
  | { state: "searching"; since: string }
  | { state: "in_room"; roomId: string }

function db(): Sql {
  const sql = getDb()
  if (!sql) throw new Error("database_unavailable")
  return sql
}

// ───────────────────────── eligibility ─────────────────────────

type EligibilityRow = {
  id: string
  is_active: boolean
  is_blocked: boolean
  birth_date: Date | null
  profile_birthdate: string | null
  consent_at: string | null
}

export async function checkEligibility(userId: string): Promise<{ ok: true } | { ok: false; code: Ineligible }> {
  const sql = db()
  const [u] = await sql<EligibilityRow[]>`
    SELECT id, is_active, COALESCE(is_blocked, false) AS is_blocked, birth_date,
           profile->>'birthdate' AS profile_birthdate,
           profile->>'sensitiveDataConsentAt' AS consent_at
    FROM users WHERE id = ${userId}
  `
  if (!u) return { ok: false, code: "not_found" }
  if (u.is_blocked || !u.is_active) return { ok: false, code: "blocked_account" }
  const age = ageFrom(u.birth_date ?? u.profile_birthdate)
  if (age === null) return { ok: false, code: "age_unknown" }
  if (age < 18) return { ok: false, code: "under_18" }
  // Matching uses gender / looking-for (GDPR Art. 9): explicit consent is required.
  if (!u.consent_at) return { ok: false, code: "consent_required" }

  if (!(await isPremium(userId).catch(() => false))) {
    const [{ n }] = await sql<{ n: number }[]>`
      SELECT count(*)::int AS n FROM blind_date_rooms
      WHERE (user_a = ${userId} OR user_b = ${userId}) AND started_at > now() - interval '24 hours'
    `
    if (n >= freeDailyDates()) return { ok: false, code: "daily_limit" }
  }
  return { ok: true }
}

// ───────────────────────── queue + matchmaking ─────────────────────────

export async function findOpenRoomId(userId: string): Promise<string | null> {
  const sql = db()
  const [row] = await sql<{ id: string }[]>`
    SELECT id FROM blind_date_rooms
    WHERE (user_a = ${userId} OR user_b = ${userId}) AND status <> 'closed'
    ORDER BY started_at DESC LIMIT 1
  `
  return row?.id ?? null
}

/**
 * Best waiting candidate for `userId`, or null. Mutual rules: gender ↔ looking-for both ways,
 * age preferences both ways, distance within both maximums (when both have coordinates),
 * a shared language, not blocked, no previous like/pass between them, no date in the cooldown.
 */
async function pickCandidate(sql: Sql, userId: string): Promise<{ id: string; common: number; distanceKm: number | null } | null> {
  const rows = await sql<{ id: string; common: number; distance_km: number | null }[]>`
    WITH me AS (
      SELECT u.id, u.gender, COALESCE(u.profile->>'lookingFor', 'all') AS looking_for,
             u.age_min, u.age_max, u.latitude, u.longitude, COALESCE(u.max_distance, 100) AS max_distance,
             u.purpose,
             COALESCE(u.birth_date, CASE WHEN u.profile->>'birthdate' ~ '^\\d{4}-\\d{2}-\\d{2}' THEN substr(u.profile->>'birthdate', 1, 10)::date END) AS bdate,
             q.lang, q.languages
      FROM users u JOIN blind_date_queue q ON q.user_id = u.id
      WHERE u.id = ${userId}
    ),
    cand AS (
      SELECT u.id, u.gender, COALESCE(u.profile->>'lookingFor', 'all') AS looking_for,
             u.age_min, u.age_max, u.latitude, u.longitude, COALESCE(u.max_distance, 100) AS max_distance,
             u.purpose,
             COALESCE(u.birth_date, CASE WHEN u.profile->>'birthdate' ~ '^\\d{4}-\\d{2}-\\d{2}' THEN substr(u.profile->>'birthdate', 1, 10)::date END) AS bdate,
             q.lang, q.languages, q.joined_at
      FROM blind_date_queue q JOIN users u ON u.id = q.user_id
      WHERE q.user_id <> ${userId}
        AND q.last_seen_at > now() - (${QUEUE_STALE_MS / 1000} || ' seconds')::interval
        AND u.is_active AND NOT COALESCE(u.is_blocked, false)
        AND u.profile->>'sensitiveDataConsentAt' IS NOT NULL
    ),
    scored AS (
      SELECT c.id, c.joined_at,
        (SELECT count(*)::int FROM user_interests a JOIN user_interests b ON a.interest_id = b.interest_id
          WHERE a.user_id = me.id AND b.user_id = c.id) AS common,
        CASE WHEN me.latitude IS NOT NULL AND me.longitude IS NOT NULL AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL
          THEN 6371 * 2 * asin(sqrt(
            power(sin(radians(c.latitude - me.latitude) / 2), 2) +
            cos(radians(me.latitude)) * cos(radians(c.latitude)) * power(sin(radians(c.longitude - me.longitude) / 2), 2)))
        END AS distance_km,
        (me.purpose IS NOT NULL AND me.purpose = c.purpose) AS same_purpose,
        me.max_distance AS my_max, c.max_distance AS their_max
      FROM me, cand c
      WHERE
        -- what I'm looking for ↔ their gender, and the other way round
        (me.looking_for = 'all' OR (me.looking_for = 'men' AND c.gender = 'male') OR (me.looking_for = 'women' AND c.gender = 'female'))
        AND (c.looking_for = 'all' OR (c.looking_for = 'men' AND me.gender = 'male') OR (c.looking_for = 'women' AND me.gender = 'female'))
        -- adults only, and each person's age range
        AND c.bdate IS NOT NULL AND c.bdate <= (now() - interval '18 years')::date
        AND (me.age_min IS NULL OR date_part('year', age(c.bdate)) >= me.age_min)
        AND (me.age_max IS NULL OR date_part('year', age(c.bdate)) <= me.age_max)
        AND (c.age_min IS NULL OR date_part('year', age(me.bdate)) >= c.age_min)
        AND (c.age_max IS NULL OR date_part('year', age(me.bdate)) <= c.age_max)
        -- a shared language
        AND (c.lang = me.lang OR c.languages && me.languages)
        -- safety and history
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = me.id AND b.blocked_id = c.id) OR (b.blocker_id = c.id AND b.blocked_id = me.id))
        AND NOT EXISTS (SELECT 1 FROM likes l WHERE (l.from_user = me.id AND l.to_user = c.id) OR (l.from_user = c.id AND l.to_user = me.id))
        AND NOT EXISTS (SELECT 1 FROM discover_passes p WHERE (p.from_user = me.id AND p.to_user = c.id) OR (p.from_user = c.id AND p.to_user = me.id))
        AND NOT EXISTS (
          SELECT 1 FROM blind_date_rooms r
          WHERE ((r.user_a = me.id AND r.user_b = c.id) OR (r.user_a = c.id AND r.user_b = me.id))
            AND r.started_at > now() - (${REMATCH_COOLDOWN_DAYS} || ' days')::interval)
        AND NOT EXISTS (SELECT 1 FROM blind_date_rooms r WHERE (r.user_a = c.id OR r.user_b = c.id) AND r.status <> 'closed')
    )
    SELECT id, common, distance_km
    FROM scored
    WHERE distance_km IS NULL OR distance_km <= LEAST(my_max, their_max)
    ORDER BY (common * 10 + CASE WHEN same_purpose THEN 15 ELSE 0 END
              - COALESCE(LEAST(distance_km, 100), 50) / 5) DESC, joined_at ASC
    LIMIT 1
  `
  const best = rows[0]
  return best ? { id: best.id, common: best.common, distanceKm: best.distance_km } : null
}

function distanceBucket(km: number | null): string {
  if (km === null) return "unknown"
  if (km < 5) return "<5"
  if (km < 25) return "<25"
  if (km < 100) return "<100"
  return "100+"
}

/**
 * Join the queue (or refresh it while polling) and try to pair right away.
 * Returns the room when matched, otherwise "searching".
 */
export async function joinOrPoll(
  userId: string,
  opts: { lang: string; languages: string[] }
): Promise<{ state: "matched"; roomId: string } | { state: "searching"; since: string }> {
  const sql = db()
  const result = await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(${MATCHMAKING_LOCK})`

    const [open] = await tx<{ id: string }[]>`
      SELECT id FROM blind_date_rooms WHERE (user_a = ${userId} OR user_b = ${userId}) AND status <> 'closed' LIMIT 1
    `
    if (open) {
      await tx`DELETE FROM blind_date_queue WHERE user_id = ${userId}`
      return { state: "matched" as const, roomId: open.id, created: false }
    }

    const [q] = await tx<{ joined_at: Date }[]>`
      INSERT INTO blind_date_queue (user_id, lang, languages)
      VALUES (${userId}, ${opts.lang}, ${opts.languages})
      ON CONFLICT (user_id) DO UPDATE SET last_seen_at = now(), lang = EXCLUDED.lang, languages = EXCLUDED.languages
      RETURNING joined_at
    `

    const cand = await pickCandidate(tx as unknown as Sql, userId)
    if (!cand) return { state: "searching" as const, since: q.joined_at.toISOString() }

    const now = new Date()
    const endsAt = new Date(now.getTime() + ROOM_DURATION_MS)
    const decideUntil = new Date(endsAt.getTime() + DECISION_WINDOW_MS)
    const meta = { common: cand.common, distance: distanceBucket(cand.distanceKm) }
    const [room] = await tx<{ id: string }[]>`
      INSERT INTO blind_date_rooms (user_a, user_b, started_at, ends_at, decide_until, match_meta)
      VALUES (${cand.id}, ${userId}, ${now}, ${endsAt}, ${decideUntil}, ${tx.json(meta)})
      RETURNING id
    `
    await tx`DELETE FROM blind_date_queue WHERE user_id IN (${userId}, ${cand.id})`
    return { state: "matched" as const, roomId: room.id, created: true, peer: cand.id }
  })

  if (result.state === "matched" && "created" in result && result.created) {
    void trackServerEvent("blind_date_started", { userId, properties: { roomId: result.roomId } })
  }
  return result.state === "matched" ? { state: "matched", roomId: result.roomId } : result
}

export async function leaveQueue(userId: string): Promise<void> {
  await db()`DELETE FROM blind_date_queue WHERE user_id = ${userId}`
}

export async function queueStatus(userId: string): Promise<QueueStatus> {
  const roomId = await findOpenRoomId(userId)
  if (roomId) return { state: "in_room", roomId }
  const [q] = await db()<{ joined_at: Date }[]>`SELECT joined_at FROM blind_date_queue WHERE user_id = ${userId}`
  return q ? { state: "searching", since: q.joined_at.toISOString() } : { state: "idle" }
}

// ───────────────────────── rooms ─────────────────────────

const ROOM_COLUMNS = `id, user_a, user_b, status, started_at, ends_at, decide_until, closed_at, close_reason, closed_by,
  reveal_consent_a, reveal_consent_b, reveal_level, decision_a, decision_b, match_id, version`

async function loadRoom(roomId: string): Promise<RoomRow | null> {
  const [row] = await db()<RoomRow[]>`SELECT ${db().unsafe(ROOM_COLUMNS)} FROM blind_date_rooms WHERE id = ${roomId}`
  return row ?? null
}

export function roomSide(room: RoomRow, userId: string): "a" | "b" | null {
  return side(room, userId)
}

/** Games only run during the date itself. */
async function abandonActiveGames(roomId: string): Promise<void> {
  await db()`
    UPDATE blind_date_game_sessions SET status = 'abandoned', completed_at = now()
    WHERE room_id = ${roomId} AND status = 'active'
  `
}

function side(room: RoomRow, userId: string): "a" | "b" | null {
  if (room.user_a === userId) return "a"
  if (room.user_b === userId) return "b"
  return null
}

async function closeRoom(
  room: RoomRow,
  reason: CloseReason,
  closedBy: string | null
): Promise<RoomRow | null> {
  const [row] = await db()<RoomRow[]>`
    UPDATE blind_date_rooms
    SET status = 'closed', closed_at = now(), close_reason = ${reason}, closed_by = ${closedBy},
        version = version + 1, updated_at = now()
    WHERE id = ${room.id} AND status <> 'closed'
    RETURNING ${db().unsafe(ROOM_COLUMNS)}
  `
  if (row) {
    await abandonActiveGames(room.id)
    void trackServerEvent(`blind_date_closed`, {
      userId: closedBy ?? room.user_a,
      properties: { roomId: room.id, reason, minutes: Math.round((Date.now() - room.started_at.getTime()) / 60000) },
    })
  }
  return row ?? null
}

/**
 * Brings a room up to date with the clock: active → deciding → closed. When both chose
 * Continue, exactly one request creates the match (existing likes + matches + 24 h timer).
 */
export async function advanceRoom(room: RoomRow, now = new Date()): Promise<RoomRow> {
  if (room.status === "closed") return room

  const bothDecided = room.decision_a !== null && room.decision_b !== null
  const target = bothDecided ? "closed" : phaseAt(room, now)
  if (target === room.status) return room

  if (target === "deciding") {
    const [row] = await db()<RoomRow[]>`
      UPDATE blind_date_rooms SET status = 'deciding', version = version + 1, updated_at = now()
      WHERE id = ${room.id} AND status = 'active'
      RETURNING ${db().unsafe(ROOM_COLUMNS)}
    `
    if (row) await abandonActiveGames(room.id)
    return row ?? (await loadRoom(room.id)) ?? room
  }

  const reason = outcomeFor(room.decision_a, room.decision_b)
  const closed = await closeRoom(room, reason, null)
  if (!closed) return (await loadRoom(room.id)) ?? room

  if (reason === "matched") {
    try {
      const { createMutualMatchLikes } = await import("@/server/repositories/likes")
      await createMutualMatchLikes({
        userA: room.user_a,
        userB: room.user_b,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      const [m] = await db()<{ id: string }[]>`
        SELECT id FROM matches
        WHERE user1_id = LEAST(${room.user_a}::uuid, ${room.user_b}::uuid)
          AND user2_id = GREATEST(${room.user_a}::uuid, ${room.user_b}::uuid)
      `
      if (m) {
        const [row] = await db()<RoomRow[]>`
          UPDATE blind_date_rooms SET match_id = ${m.id}, version = version + 1, updated_at = now()
          WHERE id = ${room.id}
          RETURNING ${db().unsafe(ROOM_COLUMNS)}
        `
        void trackServerEvent("blind_date_matched", { userId: room.user_a, properties: { roomId: room.id } })
        return row ?? closed
      }
    } catch (err) {
      log.error("blind_date_match_create_failed", { roomId: room.id, err: err instanceof Error ? err.message : String(err) })
    }
  }
  return closed
}

/** Room for a participant, brought up to date. null = not found or not a participant. */
export async function getRoomForUser(roomId: string, userId: string): Promise<RoomRow | null> {
  const room = await loadRoom(roomId)
  if (!room || !side(room, userId)) return null
  return advanceRoom(room)
}

// ───────────────────────── snapshot (what the client may see) ─────────────────────────

export type RoomSnapshot = {
  id: string
  version: number
  phase: RoomStatus
  serverNow: string
  startedAt: string
  endsAt: string
  decideUntil: string
  progress: number
  /** Stage of the PEER's photo I may see (0 until both consented). */
  revealStage: RevealStage
  /** Stage unlocked by progress alone (to show "consent to unlock X %"). */
  unlockedStage: RevealStage
  me: { revealConsent: boolean; decision: Decision | null }
  peer: {
    name: string
    age: number | null
    commonInterests: string[]
    revealConsent: boolean
    decided: boolean
    /** Only after both decided (or the room closed). */
    decision: Decision | null
  }
  messages: { id: string; mine: boolean; body: string; at: string }[]
  /** Active game, or the last finished one (null before the first game). */
  game: import("@/server/blind-date/games/engine").GameView | null
  gamesPlayed: { key: string; category: string | null; result: import("@/server/blind-date/games/engine").GameResult | null }[]
  outcome: null | { reason: CloseReason; matchId: string | null; leftByMe: boolean }
}

/** Shared progress and the reveal stage both people may see right now (stored as reveal_level). */
export async function revealState(room: RoomRow): Promise<{ progress: number; revealStage: RevealStage }> {
  const sql = db()
  const [counts] = await sql<{ a: number; b: number; games: number }[]>`
    SELECT
      (SELECT count(*)::int FROM blind_date_messages WHERE room_id = ${room.id} AND sender_id = ${room.user_a}) AS a,
      (SELECT count(*)::int FROM blind_date_messages WHERE room_id = ${room.id} AND sender_id = ${room.user_b}) AS b,
      (SELECT count(*)::int FROM blind_date_game_sessions WHERE room_id = ${room.id} AND status = 'completed') AS games
  `
  const progress = connectionProgress({ messagesA: counts.a, messagesB: counts.b, gamesCompleted: counts.games })
  const revealStage = visibleRevealStage({ consentA: room.reveal_consent_a, consentB: room.reveal_consent_b, progress })
  if (revealStage > room.reveal_level) {
    await sql`UPDATE blind_date_rooms SET reveal_level = ${revealStage} WHERE id = ${room.id} AND reveal_level < ${revealStage}`
  }
  return { progress, revealStage }
}

export function peerOf(room: RoomRow, userId: string): string | null {
  const s = side(room, userId)
  return s === "a" ? room.user_b : s === "b" ? room.user_a : null
}

export async function buildSnapshot(room: RoomRow, userId: string): Promise<RoomSnapshot> {
  const sql = db()
  const mySide = side(room, userId) as "a" | "b"
  const peerId = mySide === "a" ? room.user_b : room.user_a

  const [peer] = await sql<{ name: string | null; birth_date: Date | null; profile_birthdate: string | null }[]>`
    SELECT name, birth_date, profile->>'birthdate' AS profile_birthdate FROM users WHERE id = ${peerId}
  `
  const common = await sql<{ name: string; slug: string | null }[]>`
    SELECT i.name, i.slug FROM user_interests a
    JOIN user_interests b ON a.interest_id = b.interest_id
    JOIN interests i ON i.id = a.interest_id
    WHERE a.user_id = ${userId} AND b.user_id = ${peerId}
    ORDER BY i.name LIMIT 8
  `
  const messages = await sql<{ id: string; sender_id: string; body: string; created_at: Date }[]>`
    SELECT id::text, sender_id, body, created_at FROM blind_date_messages
    WHERE room_id = ${room.id} ORDER BY id DESC LIMIT 200
  `
  const { progress, revealStage } = await revealState(room)
  const { gamesForSnapshot } = await import("@/server/blind-date/games/service")
  const games = await gamesForSnapshot(room.id, mySide)

  const myDecision = mySide === "a" ? room.decision_a : room.decision_b
  const peerDecision = mySide === "a" ? room.decision_b : room.decision_a
  const bothDecided = myDecision !== null && peerDecision !== null

  return {
    id: room.id,
    version: room.version,
    phase: room.status,
    serverNow: new Date().toISOString(),
    startedAt: room.started_at.toISOString(),
    endsAt: room.ends_at.toISOString(),
    decideUntil: room.decide_until.toISOString(),
    progress,
    revealStage,
    unlockedStage: stageForProgress(progress),
    me: { revealConsent: mySide === "a" ? room.reveal_consent_a : room.reveal_consent_b, decision: myDecision },
    peer: {
      name: firstName(peer?.name),
      age: ageFrom(peer?.birth_date ?? peer?.profile_birthdate),
      commonInterests: common.map((c) => c.slug ?? c.name),
      revealConsent: mySide === "a" ? room.reveal_consent_b : room.reveal_consent_a,
      decided: peerDecision !== null,
      decision: bothDecided || room.status === "closed" ? peerDecision : null,
    },
    messages: messages
      .reverse()
      .map((m) => ({ id: m.id, mine: m.sender_id === userId, body: m.body, at: m.created_at.toISOString() })),
    game: games.game,
    gamesPlayed: games.played,
    outcome:
      room.status === "closed"
        ? {
            reason: room.close_reason ?? "timeout",
            // The match id is only meaningful (and only shown) when both chose Continue.
            matchId: room.close_reason === "matched" ? room.match_id : null,
            leftByMe: room.closed_by === userId,
          }
        : null,
  }
}

// ───────────────────────── actions ─────────────────────────

export type ActionError = "not_found" | "closed" | "wrong_phase" | "rate_limited" | "invalid" | "contact_details" | "too_long" | "empty"

export async function bump(roomId: string): Promise<void> {
  await db()`UPDATE blind_date_rooms SET version = version + 1, updated_at = now() WHERE id = ${roomId}`
}

export async function postMessage(roomId: string, userId: string, raw: string): Promise<{ ok: true } | { ok: false; code: ActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status !== "active") return { ok: false, code: room.status === "closed" ? "closed" : "wrong_phase" }

  const check = checkMessage(raw)
  if (!check.ok) return { ok: false, code: check.code }

  const sql = db()
  const recent = await sql<{ body: string }[]>`
    SELECT body FROM blind_date_messages
    WHERE room_id = ${roomId} AND sender_id = ${userId} AND created_at > now() - interval '1 minute'
    ORDER BY id DESC
  `
  if (recent.length >= 15) return { ok: false, code: "rate_limited" }
  // The same text three times in a row within a minute is treated as spam.
  if (recent.length >= 2 && recent[0].body === check.body && recent[1].body === check.body) {
    return { ok: false, code: "rate_limited" }
  }

  await sql`INSERT INTO blind_date_messages (room_id, sender_id, body) VALUES (${roomId}, ${userId}, ${check.body})`
  await bump(roomId)
  return { ok: true }
}

export async function setRevealConsent(roomId: string, userId: string, consent: boolean): Promise<{ ok: true } | { ok: false; code: ActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status === "closed") return { ok: false, code: "closed" }
  const col = side(room, userId) === "a" ? "reveal_consent_a" : "reveal_consent_b"
  await db()`
    UPDATE blind_date_rooms SET ${db()(col)} = ${consent}, version = version + 1, updated_at = now()
    WHERE id = ${roomId}
  `
  return { ok: true }
}

export async function decide(roomId: string, userId: string, decision: Decision): Promise<{ ok: true; room: RoomRow } | { ok: false; code: ActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status !== "deciding") return { ok: false, code: room.status === "closed" ? "closed" : "wrong_phase" }
  const col = side(room, userId) === "a" ? "decision_a" : "decision_b"
  // A decision cannot be changed once made.
  const [row] = await db()<RoomRow[]>`
    UPDATE blind_date_rooms SET ${db()(col)} = ${decision}, version = version + 1, updated_at = now()
    WHERE id = ${roomId} AND status = 'deciding' AND ${db()(col)} IS NULL
    RETURNING ${db().unsafe(ROOM_COLUMNS)}
  `
  const updated = row ?? (await loadRoom(roomId))
  if (!updated) return { ok: false, code: "not_found" }
  return { ok: true, room: await advanceRoom(updated) }
}

export async function leaveRoom(roomId: string, userId: string): Promise<{ ok: true } | { ok: false; code: ActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status === "closed") return { ok: true }
  await closeRoom(room, "left", userId)
  return { ok: true }
}

export async function reportFromRoom(
  roomId: string,
  userId: string,
  input: { reasonKey: string; comment?: string | null; block: boolean }
): Promise<{ ok: true } | { ok: false; code: ActionError }> {
  const room = await loadRoom(roomId)
  if (!room) return { ok: false, code: "not_found" }
  const mySide = side(room, userId)
  if (!mySide) return { ok: false, code: "not_found" }
  const peerId = mySide === "a" ? room.user_b : room.user_a

  await db()`
    INSERT INTO reports (reporter_id, reported_user_id, reason, comment, status, blind_date_room_id)
    VALUES (${userId}, ${peerId}, ${mapReportReasonKey(input.reasonKey)}, ${input.comment ?? null}, 'pending', ${roomId})
  `
  if (input.block) await blockUserPair(userId, peerId)
  if (room.status !== "closed") await closeRoom(room, "reported", userId)
  return { ok: true }
}

/** Housekeeping for a cron job: stale queue rows, rooms whose decision window ended. */
export async function sweepBlindDates(limit = 200): Promise<{ queue: number; rooms: number }> {
  const sql = db()
  const q = await sql`DELETE FROM blind_date_queue WHERE last_seen_at < now() - interval '10 minutes' RETURNING user_id`
  const due = await sql<RoomRow[]>`
    SELECT ${sql.unsafe(ROOM_COLUMNS)} FROM blind_date_rooms
    WHERE status <> 'closed' AND (ends_at <= now()) ORDER BY ends_at LIMIT ${limit}
  `
  for (const room of due) await advanceRoom(room)
  return { queue: q.length, rooms: due.length }
}
