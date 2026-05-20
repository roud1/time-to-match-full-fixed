"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { trackProductEvent } from "@/lib/analytics-client"
import { formatProfileExtensionPrice } from "@/lib/profile-extension-pricing"
import {
  extendProfile24Hours,
  getProfileExtensionCount,
  type StoredUserProfile,
} from "@/lib/user-profile"
import { PremiumButton } from "@/components/ui/premium-button"
import { cn } from "@/lib/utils"

type ProfileExtensionCardProps = {
  profile: StoredUserProfile
  onProfileUpdate: (next: StoredUserProfile) => void
  expired: boolean
}

export function ProfileExtensionCard({ profile, onProfileUpdate, expired }: ProfileExtensionCardProps) {
  const { t, locale, location } = useI18n()
  const [flash, setFlash] = useState(false)
  const price = formatProfileExtensionPrice(location.countryCode, locale)
  const extensionCount = getProfileExtensionCount(profile)

  const handleExtend = () => {
    const next = extendProfile24Hours()
    if (!next) return
    onProfileUpdate(next)
    setFlash(true)
    setTimeout(() => setFlash(false), 2800)
    trackProductEvent("profile_extend_24h", {
      extensions_total: getProfileExtensionCount(next),
      was_expired: expired,
    })
  }

  return (
    <div
      className={cn(
        "rounded-[1.35rem] p-5 mb-5 border backdrop-blur-xl",
        expired
          ? "border-rose-500/30 bg-gradient-to-br from-rose-500/[0.1] via-transparent to-pink-500/[0.06]"
          : "border-sky-500/25 bg-gradient-to-br from-sky-500/[0.08] via-transparent to-violet-500/[0.05]"
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-sky-200/80 font-light mb-2">
        {t("profileExtendEyebrow")}
      </p>
      <h2 className="text-lg font-extralight tracking-tight text-foreground/95 mb-1.5">
        {t("profileExtendTitle")}
      </h2>
      <p className="text-sm font-light text-muted-foreground/90 leading-relaxed mb-4">
        {expired ? t("profileExtendSubtitleExpired") : t("profileExtendSubtitle")}
      </p>

      {extensionCount > 0 && (
        <p className="text-xs font-light text-sky-200/85 mb-3">
          {t("profileExtendPurchased").replace("{count}", String(extensionCount))}
        </p>
      )}

      {flash && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-light text-emerald-200/95 mb-3 text-center"
        >
          {t("profileExtendSuccess")}
        </motion.p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-extralight text-white tabular-nums">{price}</p>
          <p className="text-[10px] font-light text-muted-foreground/80 mt-0.5">{t("profileExtendPriceNote")}</p>
        </div>
        <PremiumButton type="button" onClick={handleExtend} className="shrink-0 min-h-[44px] px-6">
          {t("profileExtendCta")}
        </PremiumButton>
      </div>

      <p className="text-[10px] font-light text-muted-foreground/65 mt-4 leading-relaxed text-center">
        {t("profileExtendDemoNote")}
      </p>
    </div>
  )
}
