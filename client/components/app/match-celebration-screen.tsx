"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useI18n } from "@/client/lib/i18n"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { getMatchConversationStarters } from "@/client/lib/match-conversation-starters"
import { sendMessage } from "@/client/lib/social-store"
import { getProfilePhotos } from "@/client/lib/profile-photos"
import { getUserProfile } from "@/client/lib/user-profile"
import { computeDiscoverCompatibility, getCompatibilityHintLabel } from "@/client/lib/discover-compatibility"
import { PulseCharacter } from "@/client/components/landing/pulse-character"
import { markFirstMatchCelebrated } from "@/client/lib/product-experience"
import { PushPromptBanner } from "@/client/components/pwa/push-prompt-banner"
import { trackProductEvent } from "@/client/lib/analytics-client"
import { trackFunnelOnce } from "@/client/lib/analytics-funnel"
import { DatingTimerBadge } from "@/client/components/dating/dating-timer-badge"
import { formatExpiryCountdown } from "@/client/lib/expiry"
import { parseTimeLeftToMs } from "@/client/lib/profile-timer-mood"
import "@/app/match-celebration.css"

function formatMatchTimer(timeLeft: string): string {
  const ms = parseTimeLeftToMs(timeLeft)
  if (ms <= 0) return "00:00:00"
  return formatExpiryCountdown(ms)
}

type MatchCelebrationScreenProps = {
  profile: SwipeProfile | null
  onClose: () => void
  isFirstMatch?: boolean
}

/** 12 CSS-driven particles that burst outward on mount */
function ParticleBurst() {
  return (
    <div className="match-moment__particles" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="match-moment__particle" />
      ))}
    </div>
  )
}

export function MatchCelebrationScreen({
  profile,
  onClose,
  isFirstMatch = false,
}: MatchCelebrationScreenProps) {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const open = profile != null
  const [mounted, setMounted] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Fire particles once on open
  useEffect(() => {
    if (!open || reduce) return
    setShowParticles(false)
    const t = setTimeout(() => setShowParticles(true), 80)
    return () => clearTimeout(t)
  }, [open, reduce])

  useEffect(() => {
    if (open) {
      trackProductEvent("match_created", { first: isFirstMatch })
      if (isFirstMatch) trackFunnelOnce("first_match")
    }
  }, [open, isFirstMatch])

  useEffect(() => {
    if (open && isFirstMatch) markFirstMatchCelebrated()
  }, [open, isFirstMatch])

  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => { document.documentElement.style.overflow = prev }
  }, [open])

  const me = getUserProfile()
  const starters = getMatchConversationStarters(locale, me?.gender)
  const myPhoto = me ? getProfilePhotos(me)[0] : null
  const compatibility = profile ? computeDiscoverCompatibility(profile) : null

  const goToChat = (starterText?: string) => {
    if (!profile) return
    if (starterText?.trim()) {
      sendMessage(profile.id, starterText.trim(), locale, location.position)
    }
    onClose()
    router.push(`/app?tab=chat&with=${profile.id}`)
  }

  if (!mounted) return null

  const timerValue = profile ? formatMatchTimer(profile.timeLeft) : "24:00:00"

  return createPortal(
    <AnimatePresence>
      {open && profile && (
        <motion.div
          key={profile.id}
          role="dialog"
          aria-modal
          aria-labelledby="match-celebration-title"
          className="match-moment fixed inset-0 z-[100] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.38 }}
        >
          {/* Ambient glow */}
          <div className="match-moment__glow" aria-hidden />

          {/* First match ambient burst */}
          {isFirstMatch && !reduce && (
            <div className="match-moment__burst p9-first-match-burst" aria-hidden />
          )}

          {/* Particle burst */}
          {showParticles && <ParticleBurst />}

          <div className="match-moment__content relative z-[1] flex flex-1 flex-col min-h-0 w-full px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {/* Skip / keep swiping */}
            <button type="button" onClick={onClose} className="match-moment__continue">
              {t("matchModalContinue")}
            </button>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">

              {/* Avatars */}
              <motion.div
                initial={reduce ? false : { scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.06 }}
                className="match-moment__avatars"
              >
                {/* Me */}
                <div className="match-moment__avatar match-moment__avatar--me">
                  {myPhoto ? (
                    <Image src={myPhoto} alt="" fill className="object-cover" sizes="88px" priority />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#7209b7]/30 to-[#f72585]/20" />
                  )}
                </div>

                {/* Them */}
                <div className="match-moment__avatar match-moment__avatar--them">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    sizes="88px"
                    priority
                  />
                </div>

                {/* Pulse center */}
                <div className="match-moment__pulse-wrap" aria-hidden>
                  {!reduce && <span className="match-moment__pulse-rings" />}
                  <PulseCharacter size="mini" />
                </div>
              </motion.div>

              {/* Eyebrow — "A MATCH" */}
              <motion.p
                aria-hidden
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="match-moment__eyebrow"
              >
                {isFirstMatch ? t("matchFirstBurst") : "✦ match"}
              </motion.p>

              {/* Big title */}
              <motion.h1
                id="match-celebration-title"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className={`match-moment__title${isFirstMatch ? " match-moment__title--first" : ""}`}
              >
                {isFirstMatch ? t("matchFirstTitle") : t("datingMatchTitle")}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="match-moment__subtitle"
              >
                {isFirstMatch ? t("matchFirstSubtitle") : t("datingMatchSubtitle")}
              </motion.p>

              {/* Countdown timer — starts ticking right on the match screen */}
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.34 }}
                className="mt-4 flex flex-col items-center gap-1"
              >
                <DatingTimerBadge
                  value={timerValue}
                  label={t("datingMatchTimerLabel")}
                />
              </motion.div>

              {/* Their name */}
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="match-moment__name"
              >
                {profile.name}
              </motion.p>

              {/* Shared interest — personalisation */}
              {compatibility && (
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.44 }}
                  className="match-moment__shared"
                >
                  {getCompatibilityHintLabel(compatibility.chemistryHint, t)}
                </motion.p>
              )}

              {/* Stakes line — the key emotional beat */}
              <motion.p
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.52 }}
                className="match-moment__vanish"
              >
                {t("matchVanishLine")}
              </motion.p>
            </div>

            {/* ── Footer actions ── */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="match-moment__foot shrink-0 w-full max-w-md mx-auto space-y-3"
            >
              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => goToChat()}
                className="match-moment__cta w-full"
              >
                {t("matchModalWriteNow")} · {timerValue}
              </button>

              {/* Conversation starters */}
              <p className="match-moment__starters-label">{t("matchModalStartersTitle")}</p>
              <ul className="match-moment__starters ttm-chat-scroll">
                {starters.map((text) => (
                  <li key={text}>
                    <button
                      type="button"
                      onClick={() => goToChat(text)}
                      className="match-moment__starter"
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={() => goToChat()}
                className="match-moment__cta match-moment__cta--secondary w-full"
              >
                {t("matchModalOpenChat")}
              </button>

              {/* Push prompt (first match only) */}
              {isFirstMatch && !pushPromptDismissed && (
                <PushPromptBanner
                  className="mt-2"
                  onDismiss={() => setPushPromptDismissed(true)}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
