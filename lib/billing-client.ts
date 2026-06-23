export type BillingPlan = "premium" | "vip"

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; demo: true; message: string }
  | { ok: false; demo: false; message: string }

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

export function isStripePublishableConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  return Boolean(key && key.length > 8)
}
