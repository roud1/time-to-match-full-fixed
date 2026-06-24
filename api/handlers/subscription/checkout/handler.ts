import { NextResponse } from "next/server"
import { z } from "zod"
import Stripe from "stripe"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import {
  BILLING_PLANS,
  billingMode,
  getAppBaseUrl,
  getStripeSecretKey,
  isStripeConfigured,
  type BillingPlan,
} from "@/server/billing/config"
import { getServerEnv } from "@/config/env"

export const runtime = "nodejs"

const bodySchema = z.object({
  plan: z.enum(["premium", "vip"]).default("premium"),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/subscription/checkout — Stripe Checkout for Premium */
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

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const rl = await checkRateLimit(`subscription:checkout:${auth.session.sub}`, 10, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(request, jsonError(429, { error: "rate_limited", message: "Too many checkout attempts" }))
  }

  let body: unknown = {}
  try {
    const text = await request.text()
    body = text ? JSON.parse(text) : {}
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
    client_reference_id: auth.session.sub,
    metadata: { userId: auth.session.sub, plan },
    subscription_data: { metadata: { userId: auth.session.sub, plan } },
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
    success_url: `${base}/billing/success?plan=${plan}`,
    cancel_url: `${base}/billing/cancel`,
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
