"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { fetchSubscription, openBillingPortal, type SubscriptionInfo } from "@/lib/billing-client"
import { cn } from "@/lib/utils"

function planLabel(plan: SubscriptionInfo["plan"], t: (k: import("@/lib/i18n").TranslationKey) => string) {
  if (plan === "premium") return t("settingsSubscriptionPremium")
  if (plan === "vip") return t("settingsSubscriptionVip")
  return t("settingsSubscriptionFree")
}

export function SettingsSubscriptionCard() {
  const { t } = useI18n()
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchSubscription().then((data) => {
      if (!cancelled) {
        setInfo(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const active = info?.plan === "premium" || info?.plan === "vip"
  const periodEnd = info?.currentPeriodEnd
    ? new Date(info.currentPeriodEnd).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  async function handleManageSubscription() {
    setPortalError(null)
    setPortalLoading(true)
    const result = await openBillingPortal()
    setPortalLoading(false)
    if (result.ok) {
      window.location.href = result.url
      return
    }
    setPortalError(result.message)
  }

  return (
    <div className="ttm-brand-glass rounded-2xl px-4 py-4 space-y-2">
      <p className="p9-register-step-label">{t("settingsSubscriptionTitle")}</p>
      {loading ? (
        <p className="text-sm text-white/40 font-light animate-pulse">…</p>
      ) : (
        <>
          <p className="text-sm font-light text-white/80">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs mr-2",
                active
                  ? "bg-indigo-500/20 text-indigo-100 border border-indigo-400/30"
                  : "bg-white/5 text-white/50 border border-white/10"
              )}
            >
              {planLabel(info?.plan ?? "free", t)}
            </span>
            {active && periodEnd
              ? t("settingsSubscriptionActive").replace("{date}", periodEnd)
              : t("settingsSubscriptionNone")}
          </p>
          {!active && (
            <Link
              href="/#pricing"
              className="inline-block text-xs text-indigo-200/80 hover:text-indigo-100 font-light"
            >
              {t("settingsSubscriptionManage")} →
            </Link>
          )}
          {active && info?.configured && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => void handleManageSubscription()}
                disabled={portalLoading}
                className="inline-block text-xs text-indigo-200/80 hover:text-indigo-100 font-light disabled:opacity-50"
              >
                {portalLoading ? t("settingsSubscriptionPortalLoading") : t("settingsSubscriptionPortal")} →
              </button>
              {portalError && (
                <p className="text-xs text-rose-300/80 font-light">{t("settingsSubscriptionPortalError")}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
