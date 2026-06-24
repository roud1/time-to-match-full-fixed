import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { billingMode, isStripeConfigured } from "@/server/billing/config"
import { getSubscriptionSummary, serializeSubscription } from "@/server/monetization"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/subscription — tier, like limits, boost status */
export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonOk({
        mode: "demo" as const,
        configured: false,
        subscription: { tier: "free", status: "none", isPremium: false, currentPeriodEnd: null, premiumUntil: null },
        limits: { tier: "free", unlimited: false, dailyLimit: 20, usedToday: 0, remaining: 20, resetsAt: null },
        boost: { active: false, expiresAt: null, multiplier: 1 },
      })
    )
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const summary = await getSubscriptionSummary(auth.session.sub)

  return withCors(
    request,
    jsonOk({
      mode: billingMode(),
      configured: isStripeConfigured(),
      subscription: serializeSubscription(summary.subscription),
      limits: {
        ...summary.limits,
        dailyLimit: summary.limits.unlimited ? null : summary.limits.dailyLimit,
        remaining: summary.limits.unlimited ? null : summary.limits.remaining,
      },
      boost: summary.boost,
    })
  )
}
