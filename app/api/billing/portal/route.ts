import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { checkRateLimit } from "@/lib/server/rate-limit"
import { getAppBaseUrl, getStripeSecretKey, isStripeConfigured } from "@/lib/server/billing/config"
import { getUserSubscription, upsertUserSubscription } from "@/lib/server/billing/repository"
import { getServerEnv } from "@/lib/server/env"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/billing/portal — Stripe Customer Portal session for subscription management */
export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "not_configured", message: "billing_coming_soon" })
    )
  }

  if (!isStripeConfigured()) {
    return withCors(
      request,
      jsonError(503, { error: "not_configured", message: "billing_coming_soon" })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const rl = await checkRateLimit(`billing:portal:${session.sub}`, 20, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(request, jsonError(429, { error: "rate_limited", message: "Too many portal requests" }))
  }

  const row = await getUserSubscription(session.sub)
  if (!row) {
    return withCors(
      request,
      jsonError(404, { error: "no_subscription", message: "No subscription found" })
    )
  }

  const secret = getStripeSecretKey()!
  const stripe = new Stripe(secret)

  let customerId = row.stripe_customer_id

  if (!customerId && row.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id)
      customerId =
        typeof sub.customer === "string" ? sub.customer : (sub.customer?.id ?? null)
      if (customerId) {
        await upsertUserSubscription({
          userId: session.sub,
          plan: row.plan as "free" | "premium" | "vip",
          status: row.status,
          stripeCustomerId: customerId,
          stripeSubscriptionId: row.stripe_subscription_id,
          currentPeriodEnd: row.current_period_end,
        })
      }
    } catch {
      return withCors(
        request,
        jsonError(502, { error: "stripe_error", message: "Could not resolve Stripe customer" })
      )
    }
  }

  if (!customerId) {
    return withCors(
      request,
      jsonError(404, { error: "no_customer", message: "No Stripe customer for this account" })
    )
  }

  const base = getAppBaseUrl()
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/settings`,
  })

  if (!portal.url) {
    return withCors(request, jsonError(500, { error: "stripe_error", message: "No portal URL" }))
  }

  return withCors(request, jsonOk({ url: portal.url }))
}
