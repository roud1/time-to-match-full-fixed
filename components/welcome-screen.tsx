"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { getProfileCityName } from "@/lib/cities"
import { getInterestLabel, type InterestId } from "@/lib/interests"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { getProfileTimeLeft, getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"
import { cn } from "@/lib/utils"

export function WelcomeScreen() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [profile, setProfile] = useState<ReturnType<typeof getUserProfile>>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 71, minutes: 59, seconds: 59 })
  const [pulse, setPulse] = useState(false)

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
  }, [router])

  useEffect(() => {
    if (!profile) return
    const tick = () => {
      setTimeLeft(getProfileTimeLeft(profile.registeredAt))
      setPulse((p) => !p)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [profile])

  if (!profile) {
    return (
      <motion.div className="premium-profile-card rounded-3xl p-8 max-w-md w-full text-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </motion.div>
    )
  }

  const cityName = getProfileCityName(profile, locale)

  return (
    <div className="relative w-full max-w-lg">
      <CinematicParticles className="absolute inset-0 -z-10 opacity-60" count={24} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="premium-profile-card rounded-[1.75rem] p-6 md:p-10 w-full border border-white/10 shadow-2xl shadow-black/40"
      >
        <motion.div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 blur-xl opacity-40" />
            <motion.div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl font-extralight text-white shadow-lg shadow-pink-500/30">
              {profile.name.charAt(0).toUpperCase()}
            </motion.div>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-light tracking-[0.2em] uppercase text-pink-300 border border-pink-500/25 bg-pink-500/10 mb-4">
            {t("welcomeBadge")}
          </span>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-tight mb-2 text-white">
            {t("welcomeTitle")}, {profile.name}!
          </h1>
          <p className="text-white/60 font-light leading-relaxed text-sm md:text-base">{t("welcomeSubtitle")}</p>
        </motion.div>

        <div className="rounded-2xl p-5 mb-6 border border-white/10 bg-black/30 backdrop-blur-md">
          <p className="text-[10px] text-white/50 font-light text-center mb-4 uppercase tracking-[0.25em]">
            {t("welcomeTimerLabel")}
          </p>
          <motion.div className="flex justify-center gap-3 md:gap-4">
            {[
              { value: timeLeft.hours, label: t("hours") },
              { value: timeLeft.minutes, label: t("minutes") },
              { value: timeLeft.seconds, label: t("seconds") },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className={cn(
                    "premium-timer-cell rounded-2xl px-3 py-2 md:px-5 md:py-3 min-w-[64px] md:min-w-[80px]",
                    pulse && i === 2 && "ring-1 ring-pink-500/40"
                  )}
                >
                  <span className="text-2xl md:text-3xl font-extralight tabular-nums text-white">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] text-white/45 mt-2 block font-light uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <p className="text-[10px] text-white/45 font-light uppercase tracking-wider">{t("welcomeYourCity")}</p>
            <p className="text-sm font-light text-white/90">{cityName}</p>
          </div>
        </div>

        {profile.interests?.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] text-white/45 font-light mb-3 uppercase tracking-wider">{t("welcomeInterests")}</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((id) => (
                <span
                  key={id}
                  className="px-3 py-1 rounded-full text-xs font-light bg-pink-500/15 text-pink-200 border border-pink-500/25"
                >
                  {getInterestLabel(id as InterestId, locale)}
                </span>
              ))}
            </div>
          </div>
        )}

        <ul className="space-y-3 mb-8">
          {[t("welcomeTip1"), t("welcomeTip2"), t("welcomeTip3")].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/55 font-light">
              <span className="w-7 h-7 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20 flex items-center justify-center text-xs shrink-0">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <PremiumButton
            className="w-full min-h-[52px]"
            onClick={() => {
              enableDemoSwipeDeck()
              router.push("/app")
            }}
          >
            {t("welcomeStart")}
          </PremiumButton>
          <PremiumButton href="/profile" variant="ghost" className="w-full min-h-[48px]">
            {t("welcomeViewProfile")}
          </PremiumButton>
          <Link
            href="/"
            className="block w-full py-2 text-center text-xs text-white/40 font-light hover:text-white/70 transition-colors"
          >
            {t("welcomeBrowse")}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
