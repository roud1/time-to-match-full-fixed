import { NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { checkRateLimit } from "@/lib/server/rate-limit"
import {
  BILLING_PLANS,
  billingMode,
  getAppBaseUrl,
  getStripeSecretKey,
  isStripeConfigured,
  type BillingPlan,
} from "@/lib/server/billing/config"
import { getServerEnv } from "@/lib/server/env"

export const runtime = "nodejs"

const bodySchema = z.object({
  plan: z.enum(["premium", "vip"]),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/billing/checkout — Stripe Checkout session for Premium / VIP */
export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonOk({ mode: "demo" as const, configured: false, message: "billing_coming_soon" })
    )
  }

  if (!isStripeConfigured()) {
    return withCors(
      request,
      jsonOk({ mode: "demo" as const, configured: false, message: "billing_coming_soon" })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const rl = await checkRateLimit(`billing:checkout:${session.sub}`, 10, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(request, jsonError(429, { error: "rate_limited", message: "Too many checkout attempts" }))
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const plan = parsed.data.plan as BillingPlan
  const price = BILLING_PLANS[plan]
  const secret = getStripeSecretKey()!
  const stripe = new Stripe(secret)

  const base = getAppBaseUrl()
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: session.sub,
    metadata: { userId: session.sub, plan },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: price.currency,
          unit_amount: price.unitAmountCents,
          recurring: { interval: "month" },
          product_data: { name: price.label },
        },
      },
    ],
    success_url: `${base}/app?billing=success&plan=${plan}`,
    cancel_url: `${base}/?billing=cancel#pricing`,
  })

  if (!checkout.url) {
    return withCors(request, jsonError(500, { error: "stripe_error", message: "No checkout URL" }))
  }

  return withCors(
    request,
    jsonOk({
      mode: billingMode(),
      configured: true,
      url: checkout.url,
      sessionId: checkout.id,
    })
  )
}
