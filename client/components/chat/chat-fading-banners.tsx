"use client"

/**
 * ChatFadingBanners
 *
 * Two contextual banners shown inside the chat:
 *
 * 1. COOLING — shown when last message was >2h ago.
 *    "The connection is cooling…" — silent reminder, not alarming.
 *
 * 2. SAY NOW — shown when <30min remain.
 *    "30 minutes left. Say what matters." — the final urgency beat.
 *
 * Both are purely visual/emotional — no action required.
 * Philosophy: silence in chat = the connection is fading (book theme).
 */

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"

const TWO_HOURS_MS   = 2 * 60 * 60 * 1000
const THIRTY_MIN_MS  = 30 * 60 * 1000

type ChatFadingBannersProps = {
  expiresAt: string | undefined
  lastMessageAt: number | undefined  // unix ms of last message
  className?: string
}

export function ChatFadingBanners({
  expiresAt,
  lastMessageAt,
  className,
}: ChatFadingBannersProps) {
  const { t } = useI18n()
  const [now, setNow] = useState(() => Date.now())

  // Tick every 30s — enough resolution for these banners
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const remainingMs = expiresAt
    ? Math.max(0, new Date(expiresAt).getTime() - now)
    : null

  const silenceMs = lastMessageAt
    ? Math.max(0, now - lastMessageAt)
    : null

  // SAY NOW: <30 min left
  const showSayNow = remainingMs !== null && remainingMs > 0 && remainingMs <= THIRTY_MIN_MS

  // COOLING: >2h silence AND still >30min left (otherwise say-now takes over)
  const showCooling =
    !showSayNow &&
    silenceMs !== null &&
    silenceMs >= TWO_HOURS_MS &&
    remainingMs !== null &&
    remainingMs > THIRTY_MIN_MS

  if (!showSayNow && !showCooling) return null

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {showSayNow ? (
          <motion.div
            key="say-now"
            className="ttm-say-now-banner"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="ttm-say-now-banner__icon" aria-hidden>⏳</span>
            <span className="ttm-say-now-banner__text">
              {t("chatSayNowBanner")}
            </span>
          </motion.div>
        ) : showCooling ? (
          <motion.div
            key="cooling"
            className="ttm-cooling-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="ttm-cooling-banner__dot" aria-hidden />
            <span className="ttm-cooling-banner__text">
              {t("chatCoolingBanner")}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
