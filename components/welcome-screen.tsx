"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getProfileCityName } from "@/lib/cities"
import { getInterestLabel, type InterestId } from "@/lib/interests"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"

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
      <div className="premium-profile-card rounded-3xl p-8 max-w-md w-full text-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </div>
    )
  }

  const cityName = getProfileCityName(profile, locale)

  return (
    <div className="relative w-full max-w-lg">
      <CinematicParticles className="absolute inset-0 -z-10 opacity-60" count={12} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative overflow-hidden rounded-[1.85rem] p-6 md:p-10 w-full border border-white/12 bg-black/40 backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(168,85,247,0.12),transparent_50%)]" />
        <motion.div className="relative text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50 font-light mb-4">
            {t("welcomeRitualEyebrow")}
          </p>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-light tracking-[0.2em] uppercase text-white/70 border border-white/12 bg-white/[0.04] mb-4">
            {t("welcomeBadge")}
          </span>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight mb-2 text-white">
            {t("welcomeTitle")}, {profile.name}!
          </h1>
          <p className="text-white/60 font-light leading-relaxed text-sm md:text-base mb-3">{t("welcomeSubtitle")}</p>
          <p className="text-xs text-white/45 font-light leading-relaxed max-w-md mx-auto">{t("welcomeRitualBody")}</p>
        </motion.div>

        <div className="rounded-2xl p-5 mb-6 border border-white/10 bg-black/30 backdrop-blur-md text-center">
          <p className="text-sm font-extralight text-foreground/90 mb-1">{t("welcomeConnectionTitle")}</p>
          <p className="text-xs text-muted-foreground/80 font-light leading-relaxed">{t("welcomeConnectionBody")}</p>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center text-sm font-light text-white shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-light text-foreground/90 truncate">{profile.name}</p>
            <p className="text-xs text-muted-foreground font-light">{cityName}</p>
          </div>
        </div>

        <ul className="space-y-2 mb-8 text-left">
          {[t("welcomeTip1"), t("welcomeTip2"), t("welcomeTip3")].map((tip) => (
            <li key={tip} className="flex gap-2 text-xs font-light text-muted-foreground/85">
              <span className="text-pink-400/80 shrink-0">·</span>
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
            className="text-center text-xs font-light text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {t("welcomeEditProfile")}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
