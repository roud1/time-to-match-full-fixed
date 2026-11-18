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
import { markFirstMatchCelebrated } from "@/client/lib/product-experience"
import { PushPromptBanner } from "@/client/components/pwa/push-prompt-banner"
import { trackProductEvent } from "@/client/lib/analytics-client"
import { trackFunnelOnce } from "@/client/lib/analytics-funnel"
import { formatExpiryCountdown } from "@/client/lib/expiry"
import { parseTimeLeftToMs } from "@/client/lib/profile-timer-mood"
import "@/app/match-celebration.css"
import "./match-celebration-luvia.css"
import { Heart, MessageCircle, X } from "lucide-react"

const MATCH_WINDOW_MS = 24 * 60 * 60 * 1000

function formatMatchTimer(timeLeft: string): string {
  const ms = parseTimeLeftToMs(timeLeft)
  // A brand-new match always starts a full 24h window; an unparsable or expired profile timer must not show 00:00:00.
  if (ms <= 0) return formatExpiryCountdown(MATCH_WINDOW_MS)
  return formatExpiryCountdown(Math.min(ms, MATCH_WINDOW_MS))
}

type MatchCelebrationScreenProps = {
  profile: SwipeProfile | null
  onClose: () => void
  isFirstMatch?: boolean
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
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
  // Find shared interests between me and the match
  const sharedInterests = (me?.interests ?? []).filter((i) =>
    profile?.interests?.includes(i)
  )
  const starters = getMatchConversationStarters(locale, me?.gender, sharedInterests)
  const myPhoto = me ? getProfilePhotos(me)[0] : null

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
          className="lv-match"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.32 }}
        >
          <button type="button" onClick={onClose} className="lv-match__close" aria-label={t("lvClose")}>
            <X aria-hidden strokeWidth={2} />
          </button>

          <div className="lv-match__body">
            <motion.div
              className="lv-match__hearts"
              initial={reduce ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.05 }}
              aria-hidden
            >
              <svg className="lv-match__outline" viewBox="0 0 240 210" fill="none">
                <defs>
                  <linearGradient id="lv-match-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F35CA8" />
                    <stop offset="1" stopColor="#9B4DFF" />
                  </linearGradient>
                </defs>
                <path
                  d="M120 196 32 112C-6 75 18 16 70 16c26 0 41 14 50 30 9-16 24-30 50-30 52 0 76 59 38 96l-88 84Z"
                  stroke="url(#lv-match-g)"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="lv-match__photo lv-match__photo--me">
                {myPhoto ? (
                  <Image src={myPhoto} alt="" fill className="object-cover" sizes="140px" priority />
                ) : (
                  <span className="lv-match__photo-empty" />
                )}
              </span>
              <span className="lv-match__photo lv-match__photo--them">
                <Image src={profile.image} alt="" fill className="object-cover" sizes="140px" priority />
              </span>
              <span className="lv-match__badge">
                <Heart aria-hidden fill="currentColor" strokeWidth={0} />
              </span>
            </motion.div>

            <h1 id="match-celebration-title" className="lv-match__title">
              {t("lvMatchTitle")} <Heart aria-hidden className="lv-match__title-heart" strokeWidth={2} />
            </h1>
            <p className="lv-match__subtitle">{t("lvMatchSubtitle")}</p>
            <p className="lv-match__time-left">{t("lvMatchTimer").replace("{time}", timerValue)}</p>

            {starters.length > 0 && (
              <div className="lv-match__starters">
                <p className="lv-match__starters-label">{t("lvMatchStarters")}</p>
                <ul>
                  {starters.slice(0, 3).map((text) => (
                    <li key={text}>
                      <button type="button" onClick={() => goToChat(text)}>
                        {text}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lv-match__actions">
            <button type="button" onClick={() => goToChat()} className="lv-match__primary">
              <MessageCircle aria-hidden strokeWidth={2} />
              {t("lvMatchWrite")}
            </button>
            <button type="button" onClick={onClose} className="lv-match__secondary">
              {t("lvMatchKeepSwiping")}
            </button>
            {isFirstMatch && !pushPromptDismissed && (
              <PushPromptBanner className="mt-1" onDismiss={() => setPushPromptDismissed(true)} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
