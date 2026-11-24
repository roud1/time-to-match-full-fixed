import { z } from "zod"
import { jsonError, jsonOk } from "@/server/http"
import {
  buildSnapshot,
  decide,
  getRoomForUser,
  leaveRoom,
  peerOf,
  revealState,
  postMessage,
  reportFromRoom,
  setRevealConsent,
} from "@/server/blind-date/service"
import { loadPhotoBytes, primaryPhotoRef, renderRevealImage } from "@/server/blind-date/photo"
import { actionError, cors, guard, internalError, isUuid, options, readJson } from "./shared"

export { options as OPTIONS }

type Ctx = { params: Promise<{ id: string }> }

async function roomId(ctx: Ctx): Promise<string | null> {
  const { id } = await ctx.params
  return isUuid(id) ? id : null
}

/** GET /api/blind-date/rooms/:id?since=<version> — snapshot, or { unchanged } when nothing changed. */
export async function getRoom(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "room", max: 120, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  try {
    let room = await getRoomForUser(id, g.userId)
    if (!room) return actionError(request, "not_found")
    if (room.status === "active") {
      const { tickActiveGame } = await import("@/server/blind-date/games/service")
      if (await tickActiveGame(id)) room = (await getRoomForUser(id, g.userId)) ?? room
    }
    const since = Number(new URL(request.url).searchParams.get("since"))
    if (Number.isFinite(since) && since > 0 && since === room.version && room.status === "active") {
      return cors(request, jsonOk({ unchanged: true, version: room.version, serverNow: new Date().toISOString() }))
    }
    return cors(request, jsonOk(await buildSnapshot(room, g.userId)))
  } catch (err) {
    return internalError(request, "room", err)
  }
}

async function snapshotResponse(request: Request, id: string, userId: string) {
  const room = await getRoomForUser(id, userId)
  if (!room) return actionError(request, "not_found")
  return cors(request, jsonOk(await buildSnapshot(room, userId)))
}

const messageSchema = z.object({ body: z.string().max(2000) })

export async function postRoomMessage(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "msg", max: 30, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = messageSchema.safeParse(await readJson(request))
  if (!parsed.success) return actionError(request, "invalid")
  try {
    const r = await postMessage(id, g.userId, parsed.data.body)
    if (!r.ok) return actionError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "message", err)
  }
}

const revealSchema = z.object({ consent: z.boolean() })

export async function postReveal(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "reveal", max: 20, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = revealSchema.safeParse(await readJson(request))
  if (!parsed.success) return actionError(request, "invalid")
  try {
    const r = await setRevealConsent(id, g.userId, parsed.data.consent)
    if (!r.ok) return actionError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "reveal", err)
  }
}

const decisionSchema = z.object({ decision: z.enum(["continue", "pass"]) })

export async function postDecision(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "decision", max: 20, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = decisionSchema.safeParse(await readJson(request))
  if (!parsed.success) return actionError(request, "invalid")
  try {
    const r = await decide(id, g.userId, parsed.data.decision)
    if (!r.ok) return actionError(request, r.code)
    return cors(request, jsonOk(await buildSnapshot(r.room, g.userId)))
  } catch (err) {
    return internalError(request, "decision", err)
  }
}

export async function postLeave(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "leave", max: 20, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  try {
    const r = await leaveRoom(id, g.userId)
    if (!r.ok) return actionError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "leave", err)
  }
}

const reportSchema = z.object({
  reason: z.string().min(1).max(64),
  comment: z.string().max(1000).optional().nullable(),
  block: z.boolean().default(false),
})

export async function postReport(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "report", max: 10, windowMs: 60 * 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = reportSchema.safeParse(await readJson(request))
  if (!parsed.success) return cors(request, jsonError(400, { error: "validation_error" }))
  try {
    const r = await reportFromRoom(id, g.userId, {
      reasonKey: parsed.data.reason,
      comment: parsed.data.comment ?? null,
      block: parsed.data.block,
    })
    if (!r.ok) return actionError(request, r.code)
    return cors(request, jsonOk({ ok: true }))
  } catch (err) {
    return internalError(request, "report", err)
  }
}

/**
 * GET /api/blind-date/rooms/:id/photo — the peer's main photo rendered for the current mutual
 * reveal stage. 403 while the stage is 0 (no mutual consent or not enough shared progress).
 * After the room closed the photo is only available to a matched pair.
 */
export async function getRoomPhoto(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "photo", max: 60, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  try {
    const room = await getRoomForUser(id, g.userId)
    if (!room) return actionError(request, "not_found")
    if (room.status === "closed" && room.close_reason !== "matched") return cors(request, jsonError(403, { error: "not_revealed" }))
    const { revealStage } = await revealState(room)
    if (revealStage === 0) return cors(request, jsonError(403, { error: "not_revealed" }))
    const peerId = peerOf(room, g.userId)
    const ref = peerId ? await primaryPhotoRef(peerId) : null
    const bytes = ref ? await loadPhotoBytes(ref) : null
    if (!bytes) return cors(request, jsonError(404, { error: "no_photo" }))
    const image = await renderRevealImage(bytes, revealStage)
    return new Response(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, no-store",
        "X-Reveal-Stage": String(revealStage),
      },
    })
  } catch (err) {
    return internalError(request, "photo", err)
  }
}

// ───────────────────────── games ─────────────────────────

const GAME_ERROR_STATUS: Record<string, number> = {
  not_found: 404,
  room_not_active: 409,
  game_active: 409,
  premium_required: 402,
  wrong_round: 409,
  already_answered: 409,
  not_your_turn: 409,
  invalid_answer: 400,
  contact_details: 422,
  too_long: 422,
  empty: 422,
}

function gameError(request: Request, code: string) {
  return cors(request, jsonError(GAME_ERROR_STATUS[code] ?? 400, { error: code }))
}

const startGameSchema = z.object({ game: z.string().max(40), category: z.string().max(40).optional() })

/** POST /api/blind-date/rooms/:id/games — start a game for both (one at a time). */
export async function postStartGame(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "game-start", max: 20, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = startGameSchema.safeParse(await readJson(request))
  const { isGameKey } = await import("@/server/blind-date/games/catalog")
  if (!parsed.success || !isGameKey(parsed.data.game)) return gameError(request, "invalid_answer")
  try {
    const { startGame } = await import("@/server/blind-date/games/service")
    const r = await startGame(id, g.userId, parsed.data.game, parsed.data.category)
    if (!r.ok) return gameError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "game-start", err)
  }
}

const answerSchema = z.object({
  sessionId: z.string().uuid(),
  round: z.number().int().min(0).max(50),
  answer: z
    .object({
      choice: z.number().int().optional(),
      guess: z.number().int().optional(),
      text: z.string().max(2000).optional(),
      statements: z.array(z.string().max(2000)).max(3).optional(),
      lie: z.number().int().optional(),
    })
    .strict(),
})

/** POST /api/blind-date/rooms/:id/games/answer */
export async function postGameAnswer(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "game-answer", max: 60, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = answerSchema.safeParse(await readJson(request))
  if (!parsed.success) return gameError(request, "invalid_answer")
  try {
    const { answerRound } = await import("@/server/blind-date/games/service")
    const r = await answerRound(id, g.userId, parsed.data.sessionId, parsed.data.round, parsed.data.answer)
    if (!r.ok) return gameError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "game-answer", err)
  }
}

const sessionSchema = z.object({ sessionId: z.string().uuid(), round: z.number().int().min(0).max(50).optional() })

/** POST /api/blind-date/rooms/:id/games/skip — skip the current question (both move on). */
export async function postGameSkip(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "game-skip", max: 30, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = sessionSchema.safeParse(await readJson(request))
  if (!parsed.success || parsed.data.round === undefined) return gameError(request, "invalid_answer")
  try {
    const { skipGameRound } = await import("@/server/blind-date/games/service")
    const r = await skipGameRound(id, g.userId, parsed.data.sessionId, parsed.data.round)
    if (!r.ok) return gameError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "game-skip", err)
  }
}

/** POST /api/blind-date/rooms/:id/games/end — stop the game early. */
export async function postGameEnd(request: Request, ctx: Ctx) {
  const g = await guard(request, { name: "game-end", max: 20, windowMs: 60_000 })
  if (!g.ok) return g.response
  const id = await roomId(ctx)
  if (!id) return actionError(request, "not_found")
  const parsed = sessionSchema.safeParse(await readJson(request))
  if (!parsed.success) return gameError(request, "invalid_answer")
  try {
    const { abandonGame } = await import("@/server/blind-date/games/service")
    const r = await abandonGame(id, g.userId, parsed.data.sessionId)
    if (!r.ok) return gameError(request, r.code)
    return snapshotResponse(request, id, g.userId)
  } catch (err) {
    return internalError(request, "game-end", err)
  }
}
