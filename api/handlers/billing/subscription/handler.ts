import { NextResponse } from "next/server"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { getServerEnv } from "@/config/env"
import { billingMode, isStripeConfigured } from "@/server/billing/config"
import { getSubscription } from "@/server/monetization/subscription.service"

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

  // Same source as /api/subscription (Stripe row + granted Premium + admin access), so the profile
  // and the settings can never disagree about the plan.
  const sub = await getSubscription(session.sub)
  const plan = sub.isPremium ? (sub.tier === "vip" ? "vip" : "premium") : "free"
  const end = sub.currentPeriodEnd ?? sub.premiumUntil

  return withCors(
    request,
    jsonOk({
      mode: billingMode(),
      configured: isStripeConfigured(),
      plan,
      status: sub.isPremium ? (sub.status === "none" ? "active" : sub.status) : sub.status,
      currentPeriodEnd: sub.isPremium ? (end?.toISOString() ?? null) : null,
      /** Only a paid Stripe subscription can be managed in the billing portal. */
      manageable: Boolean(sub.stripeSubscriptionId),
    })
  )
}
