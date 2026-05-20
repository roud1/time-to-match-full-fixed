"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { MATCH_CONVERSATION_STARTERS } from "@/lib/match-conversation-starters"
import { sendMessage } from "@/lib/social-store"
import { getProfilePhotos } from "@/lib/profile-photos"
import { getUserProfile } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

type MatchCelebrationScreenProps = {
  profile: SwipeProfile | null
  onClose: () => void
}

export function MatchCelebrationScreen({ profile, onClose }: MatchCelebrationScreenProps) {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const open = profile != null
  const starters = MATCH_CONVERSATION_STARTERS[locale]
  const me = getUserProfile()
  const myPhoto = me ? getProfilePhotos(me)[0] : null
  const goToChat = (starterText?: string) => {
    if (!profile) return
    if (starterText?.trim()) {
      sendMessage(profile.id, starterText.trim(), locale, location.position)
    }
    onClose()
    router.push(`/app?tab=chat&with=${profile.id}`)
  }

  return (
    <AnimatePresence>
      {open && profile && (
        <motion.div
          key={profile.id}
          role="dialog"
          aria-modal
          aria-labelledby="match-celebration-title"
          className="fixed inset-0 z-[80] flex flex-col bg-[#050508]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.35 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(236,72,153,0.35),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(139,92,246,0.22),transparent)]" />
          <CinematicParticles count={14} className="opacity-70" />

          <div className="relative z-[1] flex flex-1 flex-col min-h-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="self-end text-sm font-light text-muted-foreground hover:text-foreground px-3 py-2 touch-manipulation"
            >
              {t("matchModalContinue")}
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">
              <motion.div
                initial={reduce ? false : { scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.05 }}
                className="relative flex items-center justify-center gap-0 mb-8"
              >
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-[1.35rem] overflow-hidden ring-2 ring-pink-500/50 shadow-[0_24px_80px_-20px_rgba(236,72,153,0.55)] -rotate-6 z-[1]">
                  {myPhoto ? (
                    <Image src={myPhoto} alt="" fill className="object-cover" sizes="128px" priority />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-pink-500/30 to-purple-700/40" />
                  )}
                </div>
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-[1.35rem] overflow-hidden ring-2 ring-violet-400/45 shadow-[0_24px_80px_-20px_rgba(139,92,246,0.45)] rotate-6 -ml-8 z-[2]">
                  <Image src={profile.image} alt={profile.name} fill className="object-cover" sizes="128px" priority />
                </div>
                <motion.span
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-3xl"
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 18 }}
                  aria-hidden
                >
                  ✨
                </motion.span>
              </motion.div>

              <motion.h1
                id="match-celebration-title"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="text-3xl sm:text-4xl font-extralight tracking-tight text-center bg-gradient-to-r from-white via-pink-100 to-purple-200 bg-clip-text text-transparent"
              >
                {t("matchModalTitle")}
              </motion.h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-2 text-center text-sm font-light text-muted-foreground"
              >
                {t("matchModalSubtitle")}
              </motion.p>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mt-1 text-center text-xl font-light text-pink-100/95"
              >
                {profile.name}
              </motion.p>
              <p className="mt-5 text-xs font-light text-white/50 tracking-wide text-center max-w-[260px]">
                {t("connectionMatchStarted")}
              </p>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="shrink-0 w-full max-w-md mx-auto space-y-4"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-pink-200/80 font-light text-center">
                {t("matchModalStartersTitle")}
              </p>
              <ul className="space-y-2 max-h-[min(28dvh,220px)] overflow-y-auto ttm-chat-scroll pr-0.5">
                {starters.map((text) => (
                  <li key={text}>
                    <button
                      type="button"
                      onClick={() => goToChat(text)}
                      className={cn(
                        "w-full rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-left text-sm font-light",
                        "text-foreground/90 hover:border-pink-500/35 hover:bg-pink-500/[0.08] transition-colors touch-manipulation"
                      )}
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => goToChat()}
                className={cn(
                  "w-full rounded-2xl py-4 text-sm font-light text-white touch-manipulation",
                  "bg-gradient-to-r from-pink-500 via-pink-600 to-purple-700",
                  "shadow-[0_20px_50px_-16px_rgba(236,72,153,0.55)] border border-pink-300/25",
                  "hover:brightness-110 active:scale-[0.98] transition-all"
                )}
              >
                {t("matchModalOpenChat")}
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
