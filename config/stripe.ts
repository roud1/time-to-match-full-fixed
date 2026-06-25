import { getServerEnv } from "@/config/env"

export type BillingPlan = "premium" | "vip"

function centsFromEnv(key: string, fallback: number): number {
  const raw = process.env[key]?.trim()
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export const BILLING_PLANS: Record<
  BillingPlan,
  { label: string; unitAmountCents: number; currency: string }
> = {
  premium: {
    label: "Time to Match Premium",
    unitAmountCents: centsFromEnv("STRIPE_PREMIUM_CENTS", 1499),
    currency: "usd",
  },
  vip: {
    label: "Time to Match VIP",
    unitAmountCents: centsFromEnv("STRIPE_VIP_CENTS", 2999),
    currency: "usd",
  },
}

export function isStripeConfigured(): boolean {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  const pub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  return Boolean(secret && pub && secret.length > 8)
}

export function getStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  return key && key.length > 8 ? key : null
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null
}

export function billingMode(): "demo" | "live" {
  if (!getServerEnv().isDatabaseConfigured) return "demo"
  return isStripeConfigured() ? "live" : "demo"
}
