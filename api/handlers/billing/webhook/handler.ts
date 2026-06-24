import { NextResponse } from "next/server"
import Stripe from "stripe"
import { jsonError, jsonOk, withCors } from "@/server/http"
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
  type BillingPlan,
} from "@/server/billing/config"
import {
  getUserIdByStripeSubscriptionId,
  upsertUserSubscription,
} from "@/server/billing/repository"
import { activateBoost } from "@/server/monetization/boost.service"
import {
  claimStripeWebhookEvent,
  releaseStripeWebhookEvent,
} from "@/server/billing/webhook-events"

export const runtime = "nodejs"

function planFromMetadata(meta: Stripe.Metadata | null): BillingPlan | "free" {
  const plan = meta?.plan
  if (plan === "premium" || plan === "vip") return plan
  return "free"
}

function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const raw = (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end
  return typeof raw === "number" ? new Date(raw * 1000) : null
}

async function resolveUserId(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.userId) return sub.metadata.userId
  return getUserIdByStripeSubscriptionId(sub.id)
}

async function processStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId ?? session.client_reference_id
      if (!userId) break

      if (session.metadata?.type === "boost") {
        await activateBoost(userId)
        break
      }

      const plan = planFromMetadata(session.metadata)
      await upsertUserSubscription({
        userId,
        plan,
        status: "active",
        stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null,
        currentPeriodEnd: null,
      })
      break
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription
      const userId = await resolveUserId(sub)
      if (!userId) break
      const plan = planFromMetadata(sub.metadata)
      await upsertUserSubscription({
        userId,
        plan: sub.status === "active" || sub.status === "trialing" ? plan : "free",
        status: sub.status,
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: subscriptionPeriodEnd(sub),
      })
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const userId = await resolveUserId(sub)
      if (!userId) break
      await upsertUserSubscription({
        userId,
        plan: "free",
        status: "canceled",
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: null,
      })
      break
    }
    default:
      break
  }
}

/** POST /api/billing/webhook — activate subscription after Stripe checkout */
export async function POST(request: Request) {
  const secret = getStripeSecretKey()
  const webhookSecret = getStripeWebhookSecret()
  if (!secret || !webhookSecret) {
    return withCors(request, jsonError(503, { error: "not_configured", message: "Stripe webhook not configured" }))
  }

  const stripe = new Stripe(secret)
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return withCors(request, jsonError(400, { error: "missing_signature", message: "No stripe-signature header" }))
  }

  const raw = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret)
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_signature", message: "Webhook signature invalid" }))
  }

  const claimed = await claimStripeWebhookEvent(event.id)
  if (!claimed) {
    return withCors(request, jsonOk({ received: true, duplicate: true }))
  }

  try {
    await processStripeEvent(event)
  } catch (err) {
    await releaseStripeWebhookEvent(event.id)
    console.error("[billing/webhook] processing failed", event.id, err)
    return withCors(request, jsonError(500, { error: "processing_failed", message: "Webhook processing failed" }))
  }

  return withCors(request, jsonOk({ received: true }))
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}
