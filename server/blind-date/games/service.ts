/**
 * Blind Date games — persistence. One active game per room (unique index); every change runs in
 * a transaction with the session row locked, then bumps the room version so both clients refresh.
 */

import { getDb } from "@/server/db"
import { trackServerEvent } from "@/server/analytics/track"
import { isPremium } from "@/server/monetization/subscription.service"
import { bump, getRoomForUser, roomSide } from "@/server/blind-date/service"
import { GAMES, isCompatCategory, type CompatCategory, type GameKey } from "@/server/blind-date/games/catalog"
import {
  applyAnswer,
  isFinished,
  newGameState,
  skipRound,
  summarize,
  tick,
  viewFor,
  type Answer,
  type EngineError,
  type GameResult,
  type GameState,
  type GameView,
  type Side,
} from "@/server/blind-date/games/engine"

type Sql = NonNullable<ReturnType<typeof getDb>>

type SessionRow = {
  id: string
  room_id: string
  game_key: GameKey
  status: "active" | "completed" | "abandoned"
  state: GameState
  result: GameResult | null
}

export type GameActionError = EngineError | "not_found" | "room_not_active" | "game_active" | "premium_required"

function db(): Sql {
  const sql = getDb()
  if (!sql) throw new Error("database_unavailable")
  return sql
}

/** Finishes a session whose last round is done: completed if at least one round was played by both. */
function finalize(state: GameState): { status: SessionRow["status"]; result: GameResult | null } {
  if (!isFinished(state)) return { status: "active", result: null }
  const result = summarize(state)
  return { status: result.answered > 0 ? "completed" : "abandoned", result }
}

async function saveState(tx: Sql, row: SessionRow, state: GameState): Promise<SessionRow> {
  const { status, result } = finalize(state)
  const [saved] = await tx<SessionRow[]>`
    UPDATE blind_date_game_sessions
    SET state = ${tx.json(state as never)}, status = ${status}, result = ${result ? tx.json(result as never) : null},
        completed_at = ${status === "active" ? null : new Date()}
    WHERE id = ${row.id}
    RETURNING id, room_id, game_key, status, state, result
  `
  return saved
}

export async function startGame(
  roomId: string,
  userId: string,
  key: GameKey,
  category?: string
): Promise<{ ok: true } | { ok: false; code: GameActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status !== "active") return { ok: false, code: "room_not_active" }
  const def = GAMES[key]
  if (def.premium && !(await isPremium(userId).catch(() => false))) return { ok: false, code: "premium_required" }
  const cat: CompatCategory | undefined = key === "compat" ? (isCompatCategory(category) ? category : "values") : undefined
  const state = newGameState(def.build({ category: cat, random: Math.random }), new Date(), {
    roundSeconds: def.roundSeconds,
    category: cat,
  })
  try {
    await db()`
      INSERT INTO blind_date_game_sessions (room_id, game_key, started_by, state)
      VALUES (${roomId}, ${key}, ${userId}, ${db().json(state as never)})
    `
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return { ok: false, code: "game_active" }
    throw err
  }
  await bump(roomId)
  void trackServerEvent("blind_date_game_started", { userId, properties: { roomId, game: key } })
  return { ok: true }
}

async function mutate(
  roomId: string,
  userId: string,
  sessionId: string,
  fn: (state: GameState, side: Side, now: Date) => { ok: true; state: GameState } | { ok: false; code: EngineError }
): Promise<{ ok: true } | { ok: false; code: GameActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status !== "active") return { ok: false, code: "room_not_active" }
  const side = roomSide(room, userId)!
  const outcome = await db().begin(async (tx) => {
    const [row] = await tx<SessionRow[]>`
      SELECT id, room_id, game_key, status, state, result FROM blind_date_game_sessions
      WHERE id = ${sessionId} AND room_id = ${roomId} AND status = 'active'
      FOR UPDATE
    `
    if (!row) return { ok: false as const, code: "not_found" as const }
    const now = new Date()
    const r = fn(tick(row.state, now), side, now)
    if (!r.ok) return r
    const saved = await saveState(tx as unknown as Sql, row, r.state)
    return { ok: true as const, saved }
  })
  if (!outcome.ok) return outcome
  await bump(roomId)
  if (outcome.saved.status !== "active") {
    void trackServerEvent("blind_date_game_finished", {
      userId,
      properties: { roomId, game: outcome.saved.game_key, status: outcome.saved.status, ...(outcome.saved.result ?? {}) },
    })
  }
  return { ok: true }
}

export function answerRound(roomId: string, userId: string, sessionId: string, round: number, answer: Answer) {
  return mutate(roomId, userId, sessionId, (state, side, now) => applyAnswer(state, side, round, answer, now))
}

export function skipGameRound(roomId: string, userId: string, sessionId: string, round: number) {
  return mutate(roomId, userId, sessionId, (state, _side, now) => skipRound(state, round, now))
}

export async function abandonGame(roomId: string, userId: string, sessionId: string): Promise<{ ok: true } | { ok: false; code: GameActionError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  const sql = db()
  // A game left midway still counts when at least one round was played by both.
  const done = await sql.begin(async (tx) => {
    const [row] = await tx<SessionRow[]>`
      SELECT id, room_id, game_key, status, state, result FROM blind_date_game_sessions
      WHERE id = ${sessionId} AND room_id = ${roomId} AND status = 'active' FOR UPDATE
    `
    if (!row) return false
    const result = summarize(row.state)
    await tx`
      UPDATE blind_date_game_sessions
      SET status = ${result.answered > 0 ? "completed" : "abandoned"}, result = ${tx.json(result as never)}, completed_at = now()
      WHERE id = ${row.id}
    `
    return true
  })
  if (!done) return { ok: false, code: "not_found" }
  await bump(roomId)
  return { ok: true }
}

/**
 * Advances a timed game whose round ran out (Spark). Called before answering "unchanged" to a
 * poll, so a timeout is noticed even when nobody acts. Returns true when something changed.
 */
export async function tickActiveGame(roomId: string): Promise<boolean> {
  const sql = db()
  const [active] = await sql<SessionRow[]>`
    SELECT id, room_id, game_key, status, state, result FROM blind_date_game_sessions
    WHERE room_id = ${roomId} AND status = 'active'
  `
  if (!active || tick(active.state, new Date()) === active.state) return false
  const changed = await sql.begin(async (tx) => {
    const [row] = await tx<SessionRow[]>`
      SELECT id, room_id, game_key, status, state, result FROM blind_date_game_sessions
      WHERE id = ${active.id} AND status = 'active' FOR UPDATE
    `
    if (!row) return false
    const next = tick(row.state, new Date())
    if (next === row.state) return false
    await saveState(tx as unknown as Sql, row, next)
    return true
  })
  if (changed) await bump(roomId)
  return changed
}

/**
 * Game part of the room snapshot: the active game or the most
 * recent finished one, plus the list of finished games with their scores.
 */
export async function gamesForSnapshot(
  roomId: string,
  me: Side
): Promise<{ game: GameView | null; played: { key: GameKey; category: string | null; result: GameResult | null }[] }> {
  const sql = db()
  const rows = await sql<SessionRow[]>`
    SELECT id, room_id, game_key, status, state, result FROM blind_date_game_sessions
    WHERE room_id = ${roomId} ORDER BY created_at DESC LIMIT 20
  `
  const latest = rows[0] ?? null
  return {
    game: latest
      ? viewFor({ id: latest.id, key: latest.game_key, status: latest.status, state: latest.state, result: latest.result }, me)
      : null,
    played: rows
      .filter((r) => r.status === "completed")
      .map((r) => ({ key: r.game_key, category: r.state.category ?? null, result: r.result })),
  }
}
