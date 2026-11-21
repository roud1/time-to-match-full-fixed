"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { fetchSubscriptionSummary, startPremiumCheckout } from "@/client/lib/monetization/api"
import type { SubscriptionApiResponse } from "@/client/lib/monetization/types"
import { getAppMode } from "@/client/lib/auth/client"
import {
  activatePremium,
  isPremiumActive,
  type StoredUserProfile,
} from "@/client/lib/user-profile"
import { cn } from "@/client/lib/utils"
import { Check, Crown } from "lucide-react"
import "./premium-luvia.css"

// Only what the server actually grants to Premium (likes limit, incoming likes, rewind, boost, super likes).
const FEATURE_KEYS = [
  "lvPremUnlimitedLikes",
  "premiumFeatureLikes",
  "premiumFeatureRewind",
  "premiumFeatureBoost",
  "lvPremSuperLike",
] as const

export function PremiumMembershipLuxury({
  profile,
  variant,
  onProfileUpdate,
}: {
  profile: StoredUserProfile
  variant: "page" | "sheet"
  onProfileUpdate: (next: StoredUserProfile) => void
  /** @deprecated The local-only "invisible mode" was removed (the server never honoured it). */
  showInvisibleControl?: boolean
}) {
  const { t, locale } = useI18n()
  const reduce = useReducedMotion()
  // Only the real checkout price from the server is shown (no hardcoded market prices).
  const [summary, setSummary] = useState<SubscriptionApiResponse | null>(null)
  const [localDemo, setLocalDemo] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [starting, setStarting] = useState(false)
  useEffect(() => {
    void fetchSubscriptionSummary().then(setSummary)
    void getAppMode().then((m) => setLocalDemo(m === "demo"))
  }, [])
  const plan = summary?.prices?.premium ?? null
  const premiumPrice = plan
    ? new Intl.NumberFormat(locale, { style: "currency", currency: plan.currency.toUpperCase() }).format(plan.amountCents / 100)
    : null
  const billingReady = Boolean(plan) || localDemo
  const [localActive, setLocalActive] = useState(() => isPremiumActive(profile))
  useEffect(() => {
    setLocalActive(isPremiumActive(profile))
  }, [profile])
  // The server subscription decides; the local flag only matters in the offline demo.
  const active = !localDemo && summary ? summary.subscription.isPremium : localActive
  const setActive = setLocalActive
  const activeEndRaw = summary?.subscription.currentPeriodEnd ?? summary?.subscription.premiumUntil ?? null
  const activeEnd = activeEndRaw ? Date.parse(activeEndRaw) : (profile.premiumUntil ?? NaN)
  const activeUntilLabel = Number.isFinite(activeEnd)
    ? t("lvPremActiveUntil").replace(
        "{date}",
        new Date(activeEnd).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
      )
    : t("premiumActiveBadge")

  const handleActivate = async () => {
    if (starting) return
    // Local demo without a database: simulate Premium as before.
    if (localDemo) {
      const next = activatePremium(profile)
      if (next) {
        onProfileUpdate(next)
        setActive(true)
      }
      return
    }
    setStarting(true)
    try {
      const result = await startPremiumCheckout("premium")
      if (result.url) {
        window.location.href = result.url
        return
      }
      setUnavailable(true)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className={cn("lv-prem", variant === "sheet" && "lv-prem--sheet")}>
      <motion.section
        className="lv-prem__hero"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="lv-prem__crown" aria-hidden>
          <Crown strokeWidth={1.8} />
        </span>
        <h2 className="lv-prem__title">{t("premiumLuxTitle")}</h2>
        <p className="lv-prem__subtitle">{t("lvPremSubtitle")}</p>

        {active ? <p className="lv-prem__status">{activeUntilLabel}</p> : null}

      </motion.section>

      <ul className="lv-prem__features" aria-label={t("premiumComparePlus")}>
        {FEATURE_KEYS.map((key) => (
          <li key={key}>
            <span className="lv-prem__check" aria-hidden>
              <Check strokeWidth={2.4} />
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>

      <section className="lv-prem__buy">
        {premiumPrice ? (
          <>
            <p className="lv-prem__price">
              {premiumPrice}
              <span> / {t("premiumPricePeriod")}</span>
            </p>
            <p className="lv-prem__note">{t("premiumPriceNote")}</p>
          </>
        ) : null}
        {!active && (!billingReady || unavailable) && (
          <p className="lv-prem__note lv-billing-note" role="status">
            {t("lvBillingUnavailable")}
          </p>
        )}

        {!active && billingReady && !unavailable ? (
          <button
            type="button"
            onClick={() => void handleActivate()}
            disabled={starting}
            className="lv-prem__cta"
          >
            {t("premiumActivate")}
          </button>
        ) : active ? (
          <p className="lv-prem__note">{t("premiumAlreadyActive")}</p>
        ) : null}

        {localDemo && <p className="lv-prem__note lv-prem__note--small">{t("premiumDemoNote")}</p>}
      </section>
    </div>
  )
}
