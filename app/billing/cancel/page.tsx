"use client"

import Link from "next/link"
import { XCircle } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { useI18n } from "@/client/lib/i18n"

export default function BillingCancelPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-transparent ttm-brand-universe">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
        <div className="ttm-brand-glass rounded-[1.75rem] p-8 md:p-10 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center">
            <XCircle className="w-8 h-8 text-white/45" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="ttm-brand-gradient-text text-2xl font-extralight tracking-tight">
              {t("billingCancelTitle")}
            </h1>
            <p className="text-sm text-white/55 font-light leading-relaxed">{t("billingCancelBody")}</p>
          </div>
          <CinematicButton variant="primary" className="w-full min-h-[48px]" href="/#pricing">
            {t("billingCancelCta")}
          </CinematicButton>
        </div>
      </div>
    </main>
  )
}
