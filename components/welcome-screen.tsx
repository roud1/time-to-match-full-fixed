"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getProfileCityName } from "@/lib/cities"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"

export function WelcomeScreen() {
  const { t, locale } = useI18n()
  const router = useRouter()
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
      <div className="cin-surface-panel p-8 max-w-md w-full text-center">
        <p className="ttm-cin-sub">{t("locationLoading")}</p>
      </div>
    )
  }

  const cityName = getProfileCityName(profile, locale)

  return (
    <div className="relative w-full max-w-lg">
      <CinematicParticles className="absolute inset-0 -z-10 opacity-50" count={10} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="cin-surface-panel relative overflow-hidden p-7 md:p-10 w-full"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 90% 50% at 50% -5%, rgba(255,255,255,0.06), transparent 55%)",
          }}
        />

        <div className="relative text-center mb-10">
          <p className="ttm-cin-overline mb-5">{t("welcomeRitualEyebrow")}</p>
          <span className="ttm-cin-overline inline-block px-3 py-1.5 rounded-full cin-glass mb-6">
            {t("welcomeBadge")}
          </span>
          <h1 className="ttm-cin-headline text-[2rem] md:text-4xl mb-3 text-white">
            {t("welcomeTitle")}, {profile.name}
          </h1>
          <p className="ttm-cin-sub text-sm md:text-base mb-4">{t("welcomeSubtitle")}</p>
          <p className="text-xs text-white/40 font-light leading-relaxed max-w-md mx-auto">
            {t("welcomeRitualBody")}
          </p>
        </div>

        <div className="cin-surface-inset p-5 mb-6 text-center">
          <p className="text-sm font-extralight text-white/85 mb-1">{t("welcomeConnectionTitle")}</p>
          <p className="text-xs text-white/45 font-light leading-relaxed">{t("welcomeConnectionBody")}</p>
        </div>

        <div className="cin-surface-inset px-4 py-3 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/12 bg-white/[0.06] flex items-center justify-center text-sm font-light text-white/90 shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-light text-white/90 truncate">{profile.name}</p>
            <p className="text-xs text-white/45 font-light">{cityName}</p>
          </div>
        </div>

        <ul className="space-y-3 mb-10 text-left">
          {[t("welcomeTip1"), t("welcomeTip2"), t("welcomeTip3")].map((tip) => (
            <li key={tip} className="flex gap-3 text-xs font-light text-white/50">
              <span className="text-white/35 shrink-0">—</span>
              {tip}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <PremiumButton href="/app" className="w-full min-h-[52px]">
            {t("welcomeCta")}
          </PremiumButton>
          <Link
            href="/profile"
            className="text-center text-xs font-light text-white/45 hover:text-white/80 transition-colors duration-500 py-2"
          >
            {t("welcomeEditProfile")}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
