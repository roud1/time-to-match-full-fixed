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

export function WelcomeScreen() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [profile, setProfile] = useState<ReturnType<typeof getUserProfile>>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 71, minutes: 59, seconds: 59 })

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
    const tick = () => setTimeLeft(getProfileTimeLeft(profile.registeredAt))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [profile])

  if (!profile) {
    return (
      <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </div>
    )
  }

  const cityName = getProfileCityName(profile, locale)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 md:p-10 max-w-lg w-full"
    >
      <motion.div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 text-2xl font-light text-white">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-light tracking-widest uppercase text-pink-400 border border-pink-500/20 bg-pink-500/10 mb-4">
          {t("welcomeBadge")}
        </span>
        <h1 className="text-2xl md:text-4xl font-extralight tracking-tight mb-2">
          {t("welcomeTitle")}, {profile.name}!
        </h1>
        <p className="text-muted-foreground font-light leading-relaxed">{t("welcomeSubtitle")}</p>
      </motion.div>

      <div className="glass rounded-2xl p-5 mb-6 border border-foreground/10">
        <p className="text-xs text-muted-foreground font-light text-center mb-4 uppercase tracking-widest">
          {t("welcomeTimerLabel")}
        </p>
        <div className="flex justify-center gap-3 md:gap-4">
          {[
            { value: timeLeft.hours, label: t("hours") },
            { value: timeLeft.minutes, label: t("minutes") },
            { value: timeLeft.seconds, label: t("seconds") },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="rounded-xl bg-foreground/5 border border-foreground/10 px-3 py-2 md:px-4 md:py-3 min-w-[56px] md:min-w-[72px]">
                <span className="text-xl md:text-3xl font-light tabular-nums">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground mt-1.5 block font-light">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-foreground/5 border border-foreground/10 px-4 py-3 mb-6 flex items-center gap-3">
        <svg className="w-5 h-5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <p className="text-xs text-muted-foreground font-light">{t("welcomeYourCity")}</p>
          <p className="text-sm font-light text-foreground">{cityName}</p>
        </div>
      </div>

      {profile.interests?.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-light mb-3">{t("welcomeInterests")}</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((id) => (
              <span
                key={id}
                className="px-3 py-1 rounded-full text-xs font-light bg-pink-500/10 text-pink-300 border border-pink-500/20"
              >
                {getInterestLabel(id as InterestId, locale)}
              </span>
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-3 mb-8">
        {[t("welcomeTip1"), t("welcomeTip2"), t("welcomeTip3")].map((tip, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-light">
            <span className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
              {i + 1}
            </span>
            {tip}
          </li>
        ))}
      </ul>

      <Link
        href="/app"
        onClick={() => enableDemoSwipeDeck()}
        className="block w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-light text-center tracking-wide shadow-lg shadow-pink-500/25 hover:opacity-90 transition-opacity"
      >
        {t("welcomeStart")}
      </Link>
      <Link
        href="/profile"
        className="block w-full py-3 mt-3 rounded-full border border-foreground/10 text-foreground/70 font-light text-center text-sm hover:bg-foreground/5 transition-colors"
      >
        {t("welcomeViewProfile")}
      </Link>
      <Link
        href="/"
        className="block w-full py-3 mt-2 rounded-full text-muted-foreground/70 font-light text-center text-xs hover:text-foreground transition-colors"
      >
        {t("welcomeBrowse")}
      </Link>
    </motion.div>
  )
}
