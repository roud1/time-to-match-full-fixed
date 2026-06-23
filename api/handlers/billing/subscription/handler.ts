import { NextResponse } from "next/server"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { getServerEnv } from "@/config/env"
import { billingMode, isStripeConfigured } from "@/server/billing/config"
import { getUserSubscription } from "@/server/billing/repository"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/billing/subscription — current user subscription tier */
export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonOk({
        mode: "demo" as const,
        configured: false,
        plan: "free" as const,
        status: "none",
      })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const row = await getUserSubscription(session.sub)
  const active = row && ["active", "trialing"].includes(row.status)
  const plan = active && (row.plan === "premium" || row.plan === "vip") ? row.plan : "free"

  return withCors(
    request,
    jsonOk({
      mode: billingMode(),
      configured: isStripeConfigured(),
      plan,
      status: row?.status ?? "none",
      currentPeriodEnd: row?.current_period_end?.toISOString() ?? null,
    })
  )
}
