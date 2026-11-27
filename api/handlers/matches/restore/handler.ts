import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import { listRestorableMatches, restoreMatch } from "@/server/matches/restore"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/matches/restorable — matches that ran out of time in the last 30 days. */
export async function listRestorable(request: Request) {
  if (!getServerEnv().isDatabaseConfigured) return withCors(request, jsonOk({ matches: [] }))
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  return withCors(request, jsonOk({ matches: await listRestorableMatches(auth.session.sub) }))
}

/** POST /api/matches/:id/restore — bring an expired match back for 24 h (Premium; admins: forever). */
export async function postRestore(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().isDatabaseConfigured) return withCors(request, jsonError(503, { error: "service_unavailable" }))
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const rl = await checkRateLimit(`match-restore:${auth.session.sub}`, 20, 60 * 60_000)
  if (!rl.ok) return withCors(request, jsonError(429, { error: "rate_limited" }))
  const { id } = await ctx.params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return withCors(request, jsonError(404, { error: "not_found" }))
  const r = await restoreMatch(auth.session.sub, id)
  if (!r.ok) return withCors(request, jsonError(r.code === "premium_required" ? 402 : 404, { error: r.code }))
  return withCors(request, jsonOk(r))
}
