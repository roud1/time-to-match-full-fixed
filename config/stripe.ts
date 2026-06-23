import { getServerEnv } from "@/config/env"

export type BillingPlan = "premium" | "vip"

export const BILLING_PLANS: Record<
  BillingPlan,
  { label: string; unitAmountCents: number; currency: string }
> = {
  premium: { label: "Time to Match Premium", unitAmountCents: 900, currency: "usd" },
  vip: { label: "Time to Match VIP", unitAmountCents: 1900, currency: "usd" },
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
