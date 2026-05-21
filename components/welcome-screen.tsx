"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getProfileCityName } from "@/lib/cities"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { getProfilePhotos } from "@/lib/profile-photos"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { OnboardingSyncVisual } from "@/components/product/onboarding-sync-visual"
import { ProfileAura } from "@/components/product/profile-aura"
import { ProfileIdentitySummary } from "@/components/product/profile-identity-summary"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function WelcomeScreen() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const [profile, setProfile] = useState<ReturnType<typeof getUserProfile>>(null)

  useEffect(() => {
    const stored = getUserProfile()
    if (!stored) {
      router.replace("/register")
      return
    }
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }
    setProfile(stored)
    enableDemoSwipeDeck()
  }, [router])

  if (!profile) {
    return (
      <div className="ttm-brand-glass rounded-3xl p-8 max-w-md w-full text-center">
        <p className="ttm-type-muted">{t("locationLoading")}</p>
      </div>
    )
  }

  const cityName = getProfileCityName(profile, locale)
  const photo = getProfilePhotos(profile)[0]

  return (
    <div className="relative w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="p9-onboarding relative overflow-hidden p-7 md:p-10 w-full"
      >
        <ProfileAura profile={profile} />

        <div className="relative text-center mb-8">
          <p className="ttm-badge-brand mb-4 mx-auto w-fit">{t("welcomeRitualEyebrow")}</p>
          <OnboardingSyncVisual className="mb-6" intensity="vivid" />
          <h1 className="ttm-brand-gradient-text text-[1.85rem] md:text-[2.35rem] font-extralight tracking-tight mb-2">
            {t("welcomeTitle")}, {profile.name}
          </h1>
          <p className="text-sm text-white/55 font-light leading-relaxed max-w-md mx-auto">{t("welcomeSubtitle")}</p>
        </div>

        <div className="ttm-brand-glass rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="p9-profile-avatar-ring shrink-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10">
              {photo ? (
                <Image src={photo} alt="" fill className="object-cover" sizes="56px" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-lg font-extralight text-white/90">
                  {profile.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-extralight text-white/90 truncate">{profile.name}</p>
            <p className="text-xs text-white/45 font-light">{cityName}</p>
            <p className="text-[10px] text-indigo-200/70 font-light mt-1 uppercase tracking-[0.2em]">
              {t("welcomeSyncReady")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-6">
          <p className="p9-register-step-label mb-3">{t("welcomeAtmosphereTitle")}</p>
          <ProfileIdentitySummary profile={profile} locale={locale} compact />
        </div>

        <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.06] px-4 py-3 mb-8">
          <p className="text-sm font-extralight text-white/85 mb-1">{t("welcomeConnectionTitle")}</p>
          <p className="text-xs text-white/50 font-light leading-relaxed">{t("welcomeConnectionBody")}</p>
        </div>

        <ul className="space-y-2.5 mb-8 text-left">
          {[t("welcomeTip1"), t("welcomeTip2"), t("welcomeTip3")].map((tip, i) => (
            <motion.li
              key={tip}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex gap-3 text-xs font-light text-white/50"
            >
              <span className="text-indigo-300/60 shrink-0">◆</span>
              {tip}
            </motion.li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <CinematicButton variant="primary" href="/app" className="w-full min-h-[52px]">
            {t("welcomeCta")}
          </CinematicButton>
          <Link
            href="/profile"
            className={cn(
              "text-center text-xs font-extralight text-white/45 hover:text-white/80",
              "transition-colors duration-500 py-2 touch-manipulation"
            )}
          >
            {t("welcomeEditProfile")}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
