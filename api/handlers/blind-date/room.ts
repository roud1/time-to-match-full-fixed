import { z } from "zod"
import { jsonError, jsonOk } from "@/server/http"
import {
  buildSnapshot,
  decide,
  getRoomForUser,
  leaveRoom,
  postMessage,
  reportFromRoom,
  setRevealConsent,
} from "@/server/blind-date/service"
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
    const room = await getRoomForUser(id, g.userId)
    if (!room) return actionError(request, "not_found")
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
