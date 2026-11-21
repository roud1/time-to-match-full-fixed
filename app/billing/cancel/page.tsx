"use client"

import "../../settings/settings-luvia.css"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { Navbar } from "@/client/components/navbar"
import { useI18n } from "@/client/lib/i18n"

export default function BillingCancelPage() {
  const { t } = useI18n()

  return (
    <main className="lv-set-page">
      <Navbar />
      <div className="lv-set lv-result">
        <span className="lv-result__icon lv-result__icon--muted" aria-hidden>
          <XCircle strokeWidth={1.6} />
        </span>
        <h1 className="lv-set__title">{t("billingCancelTitle")}</h1>
        <p className="lv-set__hint">{t("billingCancelBody")}</p>
        <Link href="/profile?tab=premium" className="lv-result__cta">
          {t("billingCancelCta")}
        </Link>
      </div>
    </main>
  )
}
