"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { formatPremiumPrice, resolvePremiumMarket } from "@/lib/premium-pricing"
import {
  activatePremium,
  getPremiumTimeLeft,
  isPremiumActive,
  type StoredUserProfile,
} from "@/lib/user-profile"
import { getInvisibleMode, setInvisibleMode } from "@/lib/premium-preferences"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CinematicParticles } from "@/components/ui/cinematic-particles"

const FEATURE_KEYS = [
  "premiumFeatureRewind",
  "premiumFeatureBoost",
  "premiumFeatureLikes",
  "premiumFeatureInvisible",
  "premiumFeatureTimer",
  "premiumFeaturePriority",
  "premiumFeatureReconnect",
] as const

const COMPARE_ROWS = [
  "premiumCompareRowRewind",
  "premiumCompareRowBoost",
  "premiumCompareRowLikes",
  "premiumCompareRowTimer",
] as const

export function PremiumMembershipLuxury({
  profile,
  variant,
  onProfileUpdate,
  showInvisibleControl,
}: {
  profile: StoredUserProfile
  variant: "page" | "sheet"
  onProfileUpdate: (next: StoredUserProfile) => void
  showInvisibleControl?: boolean
}) {
  const { t, locale, location } = useI18n()
  const reduce = useReducedMotion()
  const premiumPrice = formatPremiumPrice(resolvePremiumMarket(location.countryCode, locale))
  const [active, setActive] = useState(() => isPremiumActive(profile))
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, remaining: 0 })
  const [invisible, setInvisible] = useState(false)

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

  useEffect(() => {
    setInvisible(getInvisibleMode())
    const fn = () => setInvisible(getInvisibleMode())
    window.addEventListener("ttm-premium-preferences-changed", fn)
    return () => window.removeEventListener("ttm-premium-preferences-changed", fn)
  }, [])

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

  const pad = variant === "sheet" ? "p-5 pb-8" : "space-y-4"

  return (
    <div className={cn(pad, variant === "sheet" && "max-h-[min(78dvh,640px)] overflow-y-auto ttm-chat-scroll")}>
      <motion.div
        className="relative overflow-hidden rounded-[1.75rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.12] via-[#0c0a14] to-purple-900/25 shadow-[0_32px_100px_-40px_rgba(251,191,36,0.25)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,rgba(251,191,36,0.18),transparent_55%)]" />
        {!reduce && <CinematicParticles count={variant === "sheet" ? 6 : 10} className="opacity-35" />}
        <motion.div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl ttm-premium-orb"
          animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/75 font-light mb-2">{t("premiumLuxEyebrow")}</p>
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <h2 className="text-2xl md:text-[1.75rem] font-extralight tracking-tight bg-gradient-to-r from-amber-100 via-white to-white/50 bg-clip-text text-transparent">
              {t("premiumLuxTitle")}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-light text-amber-100/90 ttm-premium-badge-glow">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden />
              {t("premiumTierPlus")}
            </span>
          </div>
          <p className="text-sm font-light text-muted-foreground/90 leading-relaxed max-w-md">{t("premiumLuxSubtitle")}</p>

          {active && profile.premiumUntil ? (
            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-black/30 backdrop-blur-md px-4 py-3">
              <p className="text-[10px] font-light uppercase tracking-[0.2em] text-amber-200/90">{t("premiumActiveBadge")}</p>
              <p className="mt-1 text-sm font-light text-foreground/90">{timeLeftLabel}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm font-light leading-relaxed text-foreground/80 border-l-2 border-amber-500/40 pl-4">
              {t("premiumLuxPitch")}
            </p>
          )}

          {active && showInvisibleControl && (
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="min-w-0">
                <Label htmlFor="invisible-mode" className="text-sm font-light text-foreground/90 cursor-pointer">
                  {t("premiumInvisibleLabel")}
                </Label>
                <p className="text-[11px] font-light text-muted-foreground mt-0.5">{t("premiumInvisibleHint")}</p>
              </div>
              <Switch
                id="invisible-mode"
                checked={invisible}
                onCheckedChange={(v) => {
                  setInvisible(v)
                  setInvisibleMode(v)
                }}
                className="scale-125 origin-center data-[state=checked]:bg-amber-500/80"
              />
            </div>
          )}
        </div>
      </motion.div>

      <div className={cn("rounded-[1.35rem] border border-white/10 bg-black/25 backdrop-blur-xl", variant === "sheet" ? "p-4 mt-4" : "p-5 mt-4")}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-light mb-3 text-center">{t("premiumCompareTitle")}</p>
        <div className="space-y-0 rounded-xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-2 text-center text-[11px]">
            <div className="bg-black/50 py-2 font-light text-muted-foreground border-b border-white/10">{t("premiumCompareFree")}</div>
            <div className="bg-gradient-to-b from-amber-500/15 to-purple-900/20 py-2 font-light text-amber-100/95 border-b border-white/10">
              {t("premiumComparePlus")}
            </div>
          </div>
          {COMPARE_ROWS.map((rowKey) => (
            <div key={rowKey} className="grid grid-cols-2 text-[11px] border-b border-white/5 last:border-b-0">
              <div className="bg-black/40 px-2 py-2.5 text-muted-foreground/80 font-light flex items-center justify-center">—</div>
              <div className="bg-black/30 px-2 py-2.5 text-foreground/90 font-light flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t(rowKey)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className={cn("grid gap-2", variant === "sheet" ? "mt-4" : "mt-4")}>
        {FEATURE_KEYS.map((key, i) => (
          <motion.li
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : i * 0.03 }}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent px-3 py-2.5"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-200/95 ring-1 ring-amber-500/25">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-sm font-light text-foreground/88 leading-snug">{t(key)}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        className={cn("rounded-[1.35rem] border border-amber-500/15 bg-gradient-to-b from-amber-500/[0.06] to-transparent", variant === "sheet" ? "p-4 mt-4" : "p-6 mt-4")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
      >
        <p className="mb-1 text-center text-2xl font-extralight tracking-tight text-amber-50/95">
          {premiumPrice}
          <span className="text-sm font-light text-muted-foreground"> / {t("premiumPricePeriod")}</span>
        </p>
        <p className="mb-5 text-center text-xs font-light text-muted-foreground/85">{t("premiumPriceNote")}</p>

        {!active ? (
          <button
            type="button"
            onClick={handleActivate}
            className={cn(
              "w-full rounded-2xl py-4 text-center text-[15px] font-light tracking-wide text-white",
              "cin-btn-primary shadow-[0_20px_50px_-20px_rgba(251,191,36,0.25)]",
              "border border-amber-300/25 hover:brightness-105 active:scale-[0.99] transition-all touch-manipulation ttm-premium-cta-glow"
            )}
          >
            {t("premiumActivate")}
          </button>
        ) : (
          <p className="text-center text-sm font-light text-amber-200/90">{t("premiumAlreadyActive")}</p>
        )}

        <p className="mt-4 text-center text-[10px] font-light text-muted-foreground/65 leading-relaxed">{t("premiumDemoNote")}</p>
      </motion.div>
    </div>
  )
}
