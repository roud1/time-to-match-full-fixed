import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { requirePremium } from "@/server/monetization/access"
import { undoDiscoverPass } from "@/server/repositories/likes"
import { discoverSwipeBodySchema } from "@/server/validation/discover-swipe"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/discover/rewind — premium undo last pass (removes discover_passes row) */
export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const premium = await requirePremium(auth.session.sub)
  if (!premium.ok) {
    return withCors(
      request,
      jsonError(403, { error: "premium_required", code: "premium_required", message: "Premium required" })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON body" }))
  }

  const parsed = discoverSwipeBodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const result = await undoDiscoverPass(auth.session.sub, parsed.data.targetUserId)
  if (!result.ok) {
    const status = result.code === "blocked" ? 403 : result.code === "nothing_to_rewind" ? 404 : 404
    return withCors(
      request,
      jsonError(status, {
        error: result.code,
        message:
          result.code === "nothing_to_rewind"
            ? "No pass to rewind for this profile"
            : result.code === "blocked"
              ? "Account blocked"
              : "Target user not found",
      })
    )
  }

  return withCors(request, jsonOk({ rewound: true, targetUserId: parsed.data.targetUserId }))
}
