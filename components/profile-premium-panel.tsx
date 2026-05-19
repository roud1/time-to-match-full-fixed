"use client"

import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { formatPremiumPrice, resolvePremiumMarket } from "@/lib/premium-pricing"
import {
  activatePremium,
  getPremiumTimeLeft,
  isPremiumActive,
  type StoredUserProfile,
} from "@/lib/user-profile"
import { cn } from "@/lib/utils"

type ProfilePremiumPanelProps = {
  profile: StoredUserProfile
  onProfileUpdate: (next: StoredUserProfile) => void
}

const FEATURE_KEYS = [
  "premiumFeatureBoost",
  "premiumFeatureLikes",
  "premiumFeatureMap",
  "premiumFeatureTimer",
] as const

export function ProfilePremiumPanel({ profile, onProfileUpdate }: ProfilePremiumPanelProps) {
  const { t, locale, location } = useI18n()
  const premiumPrice = formatPremiumPrice(
    resolvePremiumMarket(location.countryCode, locale)
  )
  const [active, setActive] = useState(() => isPremiumActive(profile))
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, remaining: 0 })

  useEffect(() => {
    setActive(isPremiumActive(profile))
  }, [profile])

  useEffect(() => {
    if (!profile.premiumUntil || !active) return
    const tick = () => setTimeLeft(getPremiumTimeLeft(profile.premiumUntil!))
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [profile.premiumUntil, active])

  const handleActivate = () => {
    const next = activatePremium(profile)
    if (next) {
      onProfileUpdate(next)
      setActive(true)
    }
  }

  const timeLeftLabel = t("premiumTimeLeft")
    .replace("{days}", String(timeLeft.days))
    .replace("{hours}", String(timeLeft.hours))

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <motion.div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-pink-500/10 to-purple-600/15 p-6 md:p-8">
        <motion.div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div className="relative">
          <motion.div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
              </svg>
            </span>
            <motion.div>
              <h2 className="text-xl font-light tracking-tight text-foreground">{t("premiumTitle")}</h2>
              <p className="text-xs font-light text-muted-foreground">{t("premiumSubtitle")}</p>
            </motion.div>
          </motion.div>

          {active && profile.premiumUntil ? (
            <motion.div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <p className="text-xs font-light uppercase tracking-widest text-amber-200/90">
                {t("premiumActiveBadge")}
              </p>
              <p className="mt-1 text-sm font-light text-foreground/90">{timeLeftLabel}</p>
            </motion.div>
          ) : (
            <p className="mb-5 text-sm font-light leading-relaxed text-foreground/80">{t("premiumPitch")}</p>
          )}

          <ul className="space-y-3">
            {FEATURE_KEYS.map((key, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-foreground/10 bg-background/30 px-3 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm font-light text-foreground/85">{t(key)}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <motion.div className="glass-card rounded-3xl p-6">
        <p className="mb-1 text-center text-2xl font-extralight tracking-tight">
          {premiumPrice}
          <span className="text-sm font-light text-muted-foreground"> / {t("premiumPricePeriod")}</span>
        </p>
        <p className="mb-5 text-center text-xs font-light text-muted-foreground">{t("premiumPriceNote")}</p>

        {!active ? (
          <button
            type="button"
            onClick={handleActivate}
            className={cn(
              "w-full rounded-full py-4 text-center font-light tracking-wide text-white shadow-lg shadow-amber-500/20",
              "bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-90 transition-opacity"
            )}
          >
            {t("premiumActivate")}
          </button>
        ) : (
          <p className="text-center text-sm font-light text-amber-200/90">{t("premiumAlreadyActive")}</p>
        )}

        <p className="mt-4 text-center text-[10px] font-light text-muted-foreground/70">{t("premiumDemoNote")}</p>
      </motion.div>
    </motion.div>
  )
}
