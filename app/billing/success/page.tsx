"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { useI18n } from "@/client/lib/i18n"
import { trackProductEvent } from "@/client/lib/analytics-client"

function BillingSuccessContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") ?? "premium"

  useEffect(() => {
    trackProductEvent("billing_success", { plan })
  }, [plan])

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
      <div className="ttm-brand-glass rounded-[1.75rem] p-8 md:p-10 space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full border border-emerald-400/35 bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-300" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="ttm-brand-gradient-text text-2xl font-extralight tracking-tight">
            {t("billingSuccessTitle")}
          </h1>
          <p className="text-sm text-white/55 font-light leading-relaxed">{t("billingSuccessBody")}</p>
        </div>
        <CinematicButton variant="primary" className="w-full min-h-[48px]" href="/app">
          {t("billingSuccessCta")}
        </CinematicButton>
        <Link href="/settings" className="block text-xs text-indigo-200/70 hover:text-indigo-100 font-light">
          {t("settingsSubscriptionTitle")} →
        </Link>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-transparent ttm-brand-universe">
      <Navbar />
      <Suspense
        fallback={
          <div className="max-w-lg mx-auto px-4 pt-32 text-center text-sm text-white/45 font-light">
            {t("locationLoading")}
          </div>
        }
      >
        <BillingSuccessContent />
      </Suspense>
    </main>
  )
}
