import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import { log } from "@/server/log"

export const SUPPORTED_LANGS = ["ru", "uk", "en", "de", "es", "pl", "fr", "it", "tr"] as const

export function cors(request: Request, res: NextResponse) {
  return withCors(request, res)
}

export function options(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/**
 * Common guard: database configured, signed in (+ CSRF origin for mutations), per-user rate limit.
 * Returns the user id or a ready error response.
 */
export async function guard(
  request: Request,
  limit: { name: string; max: number; windowMs: number }
): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  if (!getServerEnv().isDatabaseConfigured) {
    return { ok: false, response: cors(request, jsonError(503, { error: "service_unavailable" })) }
  }
  const auth = await requireAuth(request)
  if (!auth.ok) return { ok: false, response: auth.response }
  const rl = await checkRateLimit(`bd:${limit.name}:${auth.session.sub}`, limit.max, limit.windowMs)
  if (!rl.ok) {
    return {
      ok: false,
      response: cors(
        request,
        jsonError(429, { error: "rate_limited" }, { headers: { "Retry-After": String(rl.retryAfterSec ?? 5) } })
      ),
    }
  }
  return { ok: true, userId: auth.session.sub }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

const ACTION_STATUS: Record<string, number> = {
  not_found: 404,
  closed: 409,
  wrong_phase: 409,
  rate_limited: 429,
  invalid: 400,
  contact_details: 422,
  too_long: 422,
  empty: 422,
}

export function actionError(request: Request, code: string) {
  return cors(request, jsonError(ACTION_STATUS[code] ?? 400, { error: code }))
}

export function internalError(request: Request, where: string, err: unknown) {
  log.error("blind_date_error", { where, err: err instanceof Error ? err.message : String(err) })
  return cors(request, jsonError(500, { error: "internal_error" }))
}

export function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}
