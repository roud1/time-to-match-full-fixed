import { NextResponse } from "next/server"
import Stripe from "stripe"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import {
  billingMode,
  getAppBaseUrl,
  getStripeSecretKey,
  isStripeConfigured,
} from "@/server/billing/config"
import { getServerEnv } from "@/config/env"
import { activateBoost, canBoost } from "@/server/monetization"
import { BOOST_CURRENCY, BOOST_PRICE_CENTS } from "@/server/monetization/constants"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/subscription/boost — activate boost (premium perk or Stripe one-time) */
export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonOk({
        mode: "demo" as const,
        configured: false,
        activated: true,
        boost: { active: true, expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), multiplier: 1.5 },
      })
    )
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const rl = await checkRateLimit(`subscription:boost:${auth.session.sub}`, 20, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(request, jsonError(429, { error: "rate_limited", message: "Too many boost attempts" }))
  }

  const access = await canBoost(auth.session.sub)
  if (!access.allowed && access.reason === "already_active") {
    return withCors(
      request,
      jsonError(409, {
        error: "boost_active",
        message: "Boost already active",
        details: { boost: { active: true, expiresAt: access.expiresAt } },
      })
    )
  }

  const premiumFreeBoost = access.allowed && !access.reason
  if (premiumFreeBoost || !isStripeConfigured()) {
    const boost = await activateBoost(auth.session.sub)
    return withCors(request, jsonOk({ mode: billingMode(), configured: isStripeConfigured(), activated: true, boost }))
  }

  const secret = getStripeSecretKey()!
  const stripe = new Stripe(secret)
  const base = getAppBaseUrl()

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: auth.session.sub,
    metadata: { userId: auth.session.sub, type: "boost" },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: BOOST_CURRENCY,
          unit_amount: BOOST_PRICE_CENTS,
          product_data: { name: "Time to Match Profile Boost" },
        },
      },
    ],
    success_url: `${base}/billing/success?type=boost`,
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
      activated: false,
      url: checkout.url,
      sessionId: checkout.id,
    })
  )
}
