export type BillingPlan = "premium" | "vip"
export type SubscriptionPlan = BillingPlan | "free"

export type SubscriptionInfo = {
  plan: SubscriptionPlan
  status: string
  currentPeriodEnd: string | null
  configured: boolean
  mode: "demo" | "live"
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; demo: true; message: string }
  | { ok: false; demo: false; message: string }

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  try {
    const res = await fetch("/api/billing/subscription", { credentials: "include", cache: "no-store" })
    const data = (await res.json()) as {
      plan?: SubscriptionPlan
      status?: string
      currentPeriodEnd?: string | null
      configured?: boolean
      mode?: "demo" | "live"
    }
    if (!res.ok) {
      return { plan: "free", status: "none", currentPeriodEnd: null, configured: false, mode: "demo" }
    }
    return {
      plan: data.plan ?? "free",
      status: data.status ?? "none",
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      configured: Boolean(data.configured),
      mode: data.mode ?? "demo",
    }
  } catch {
    return { plan: "free", status: "none", currentPeriodEnd: null, configured: false, mode: "demo" }
  }
}

export async function startBillingCheckout(plan: BillingPlan): Promise<CheckoutResult> {
  try {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
    const data = (await res.json()) as {
      url?: string
      configured?: boolean
      message?: string
      mode?: string
    }

    if (data.url) return { ok: true, url: data.url }
    if (data.configured === false || data.message === "billing_coming_soon") {
      return { ok: false, demo: true, message: data.message ?? "billing_coming_soon" }
    }
    return { ok: false, demo: false, message: data.message ?? "checkout_failed" }
  } catch {
    return { ok: false, demo: true, message: "network_error" }
  }
}

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; message: string }

export async function openBillingPortal(): Promise<PortalResult> {
  try {
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      credentials: "include",
    })
    const data = (await res.json()) as { url?: string; message?: string }
    if (res.ok && data.url) return { ok: true, url: data.url }
    return { ok: false, message: data.message ?? "portal_failed" }
  } catch {
    return { ok: false, message: "network_error" }
  }
}

export function isStripePublishableConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  return Boolean(key && key.length > 8)
}
