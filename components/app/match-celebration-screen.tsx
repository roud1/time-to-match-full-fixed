"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { getMatchConversationStarters } from "@/lib/match-conversation-starters"
import { sendMessage } from "@/lib/social-store"
import { getProfilePhotos } from "@/lib/profile-photos"
import { getUserProfile } from "@/lib/user-profile"
import { computeDiscoverCompatibility, getCompatibilityHintLabel } from "@/lib/discover-compatibility"
import { PulseCharacter } from "@/components/landing/pulse-character"
import { markFirstMatchCelebrated } from "@/lib/product-experience"
import { PushPromptBanner } from "@/components/pwa/push-prompt-banner"
import { trackProductEvent } from "@/lib/analytics-client"
import "@/app/match-celebration.css"

type MatchCelebrationScreenProps = {
  profile: SwipeProfile | null
  onClose: () => void
  isFirstMatch?: boolean
}

export function MatchCelebrationScreen({ profile, onClose, isFirstMatch = false }: MatchCelebrationScreenProps) {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const open = profile != null
  const [mounted, setMounted] = useState(false)
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      trackProductEvent("match_created", { first: isFirstMatch })
    }
  }, [open, isFirstMatch])

  useEffect(() => {
    if (open && isFirstMatch) markFirstMatchCelebrated()
  }, [open, isFirstMatch])

  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prev
    }
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
          transition={{ duration: reduce ? 0.15 : 0.4 }}
        >
          <div className="match-moment__glow" aria-hidden />
          {isFirstMatch && !reduce && <div className="match-moment__burst p9-first-match-burst" aria-hidden />}

          <div className="match-moment__content relative z-[1] flex flex-1 flex-col min-h-0 w-full px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={onClose} className="match-moment__continue">
              {t("matchModalContinue")}
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">
              <motion.div
                initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.08 }}
                className="match-moment__avatars"
              >
                <div className="match-moment__avatar match-moment__avatar--me">
                  {myPhoto ? (
                    <Image src={myPhoto} alt="" fill className="object-cover" sizes="84px" priority />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/25" />
                  )}
                </div>

                <div className="match-moment__avatar match-moment__avatar--them">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    sizes="84px"
                    priority
                  />
                </div>

                <div className="match-moment__pulse-wrap" aria-hidden>
                  {!reduce && <span className="match-moment__pulse-rings" />}
                  <PulseCharacter size="mini" />
                </div>
              </motion.div>

              <motion.h1
                id="match-celebration-title"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="match-moment__title"
              >
                {isFirstMatch ? t("matchFirstTitle") : t("matchModalTitle")}
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="match-moment__subtitle"
              >
                {isFirstMatch ? t("matchFirstSubtitle") : t("matchModalSubtitle")}
              </motion.p>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="match-moment__name"
              >
                {profile.name}
              </motion.p>

              {compatibility && (
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.36 }}
                  className="match-moment__hint"
                >
                  {getCompatibilityHintLabel(compatibility.chemistryHint, t)}
                </motion.p>
              )}

              <motion.p
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="match-moment__body"
              >
                {t("matchModalBody")}
              </motion.p>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="match-moment__foot shrink-0 w-full max-w-md mx-auto space-y-3"
            >
              <p className="match-moment__starters-label">{t("matchModalStartersTitle")}</p>
              <ul className="match-moment__starters ttm-chat-scroll">
                {starters.map((text) => (
                  <li key={text}>
                    <button type="button" onClick={() => goToChat(text)} className="match-moment__starter">
                      {text}
                    </button>
                  </li>
                ))}
              </ul>

              <button type="button" onClick={() => goToChat()} className="match-moment__cta">
                {t("matchModalOpenChat")}
              </button>

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
