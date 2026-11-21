"use client"

import "../../settings/settings-luvia.css"
import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { useI18n } from "@/client/lib/i18n"
import { trackProductEvent } from "@/client/lib/analytics-client"
import { fetchSubscriptionSummary } from "@/client/lib/monetization/api"

function BillingSuccessContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? "premium"
  const isBoost = searchParams.get("type") === "boost"

  useEffect(() => {
    trackProductEvent("billing_success", { plan })
    // Pick up the subscription the Stripe webhook stored (mirrors it into the local cache).
    void fetchSubscriptionSummary()
  }, [plan])

  return (
    <div className="lv-set lv-result">
      <span className="lv-result__icon" aria-hidden>
        <CheckCircle2 strokeWidth={1.6} />
      </span>
      <h1 className="lv-set__title">{isBoost ? t("lvBoostPaidTitle") : t("billingSuccessTitle")}</h1>
      <p className="lv-set__hint">{isBoost ? t("lvBoostPaidBody") : t("billingSuccessBody")}</p>
      <Link href="/app" className="lv-result__cta">
        {t("billingSuccessCta")}
      </Link>
      <Link href="/settings" className="lv-set__link">
        {t("settingsSubscriptionTitle")}
      </Link>
    </div>
  )
}

export default function BillingSuccessPage() {
  const { t } = useI18n()

  return (
    <main className="lv-set-page">
      <Navbar />
      <Suspense fallback={<p className="lv-set lv-set__hint">{t("locationLoading")}</p>}>
        <BillingSuccessContent />
      </Suspense>
    </main>
  )
}
