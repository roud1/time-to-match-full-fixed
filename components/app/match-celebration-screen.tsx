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
import { computeDiscoverCompatibility } from "@/lib/discover-compatibility"
import { getCompatibilityHintLabel } from "@/lib/discover-compatibility"
import { SyncRing } from "@/components/sync/sync-ring"
import type { SyncMetrics } from "@/lib/sync-system"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { markFirstMatchCelebrated } from "@/lib/product-experience"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

type MatchCelebrationScreenProps = {
  profile: SwipeProfile | null
  onClose: () => void
  isFirstMatch?: boolean
}

const PARTICLE_OFFSETS = [
  { x: -72, y: -28, delay: 0.35 },
  { x: 68, y: -22, delay: 0.42 },
  { x: -48, y: 18, delay: 0.5 },
  { x: 52, y: 24, delay: 0.48 },
  { x: 0, y: -40, delay: 0.38 },
  { x: -88, y: 8, delay: 0.55 },
  { x: 84, y: 12, delay: 0.52 },
]

export function MatchCelebrationScreen({ profile, onClose, isFirstMatch = false }: MatchCelebrationScreenProps) {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const reduce = useReducedMotion()
  const open = profile != null

  useEffect(() => {
    if (open && isFirstMatch) markFirstMatchCelebrated()
  }, [open, isFirstMatch])
  const starters = MATCH_CONVERSATION_STARTERS[locale]
  const me = getUserProfile()
  const myPhoto = me ? getProfilePhotos(me)[0] : null
  const compatibility = profile ? computeDiscoverCompatibility(profile) : null
  const resonance = compatibility?.resonancePercent ?? 72
  const syncMetrics: SyncMetrics = {
    syncPercent: resonance,
    connectionPercent: resonance,
    chemistryPercent: compatibility?.conversationPotential ?? 68,
    energyPercent: compatibility?.energyLevel ?? 70,
    bondPercent: Math.round(resonance * 0.88),
    tier: resonance >= 80 ? "synced" : "vibrant",
    isActive: true,
    isFading: false,
    isSynced: resonance >= 90,
    recentActivity: true,
    aiEnhanced: true,
  }

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
          className="match-moment fixed inset-0 z-[80] flex flex-col bg-[var(--bg-primary)]/96 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.4 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_15%,rgba(220,225,255,0.14),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_90%,rgba(160,140,220,0.08),transparent)]" />
          {isFirstMatch && !reduce && <div className="p9-first-match-burst" aria-hidden />}
          <CinematicParticles count={isFirstMatch ? 12 : 8} className="opacity-50" />

          <motion.div
            className="match-moment__sync-line pointer-events-none"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "28%", opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />

          {!reduce &&
            PARTICLE_OFFSETS.map((p, i) => (
              <motion.span
                key={i}
                className="match-moment__particle pointer-events-none"
                style={{ left: "50%", top: "42%" }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [0, 1, 0.4],
                  scale: [0, 1.2, 0.6],
                }}
                transition={{ delay: p.delay, duration: 1.1, ease: "easeOut" }}
                aria-hidden
              />
            ))}

          <div className="relative z-[1] flex flex-1 flex-col min-h-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="self-end text-sm font-normal text-muted-foreground hover:text-foreground px-3 py-2 touch-manipulation transition-colors"
            >
              {t("matchModalContinue")}
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">
              <motion.div
                initial={reduce ? false : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.08 }}
                className="relative flex items-center justify-center mb-10"
              >
                <motion.div
                  className="match-moment__ring match-moment__ring--merge -mr-4 z-[1]"
                  style={{ ["--match-ring-glow" as string]: "rgba(200, 210, 255, 0.45)" }}
                  initial={reduce ? false : { x: -20, opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SyncRing metrics={syncMetrics} size="lg" aiBoost syncSurge>
                    <div className="relative h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 rounded-[1.15rem] overflow-hidden ring-1 ring-white/20">
                      {myPhoto ? (
                        <Image src={myPhoto} alt="" fill className="object-cover" sizes="80px" priority />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/30" />
                      )}
                    </div>
                  </SyncRing>
                </motion.div>

                <motion.div
                  className="match-moment__ring z-[2]"
                  style={{ ["--match-ring-glow" as string]: "rgba(220, 200, 255, 0.5)" }}
                  initial={reduce ? false : { x: 24, opacity: 0.5 }}
                  animate={{ x: -8, opacity: 1 }}
                  transition={{ delay: 0.28, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SyncRing
                    metrics={syncMetrics}
                    size="lg"
                    relationshipPersonality={compatibility?.previewPersonality}
                  >
                    <div className="relative h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 rounded-[1.15rem] overflow-hidden ring-1 ring-white/25">
                      <Image
                        src={profile.image}
                        alt={profile.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        priority
                      />
                    </div>
                  </SyncRing>
                </motion.div>

                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.15, 1], opacity: [0, 0.7, 0.35] }}
                  transition={{ delay: 0.5, duration: 1 }}
                  aria-hidden
                >
                  <span className="h-24 w-24 rounded-full bg-white/[0.06] blur-2xl" />
                </motion.div>
              </motion.div>

              <motion.h1
                id="match-celebration-title"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-[1.65rem] font-medium tracking-tight text-center text-foreground"
              >
                {isFirstMatch ? t("matchFirstTitle") : t("matchModalTitle")}
              </motion.h1>
              {isFirstMatch && (
                <motion.p
                  initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.22 }}
                  className="mt-3 text-[10px] uppercase tracking-[0.28em] text-primary font-medium text-center"
                >
                  {t("matchFirstBurst")}
                </motion.p>
              )}
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="mt-2 text-center text-sm font-normal text-muted-foreground"
              >
                {isFirstMatch ? t("matchFirstSubtitle") : t("matchModalSubtitle")}
              </motion.p>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mt-3 text-center text-lg font-medium text-foreground"
              >
                {profile.name}
              </motion.p>
              {compatibility && (
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.38 }}
                  className="mt-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium text-center max-w-[280px]"
                >
                  {getCompatibilityHintLabel(compatibility.chemistryHint, t)}
                </motion.p>
              )}
              <p className="mt-3 text-xs font-normal text-muted-foreground tracking-wide text-center max-w-[260px]">
                {t("matchModalBody")}
              </p>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="shrink-0 w-full max-w-md mx-auto space-y-4"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium text-center">
                {t("matchModalStartersTitle")}
              </p>
              <ul className="space-y-2 max-h-[min(28dvh,220px)] overflow-y-auto ttm-chat-scroll pr-0.5">
                {starters.map((text) => (
                  <li key={text}>
                    <button
                      type="button"
                      onClick={() => goToChat(text)}
                      className={cn(
                        "ttm-surface-tile w-full rounded-2xl px-4 py-3 text-left text-sm font-normal",
                        "text-foreground hover:border-[var(--tile-border-strong)] transition-colors touch-manipulation"
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
                  "ttm-btn-accent w-full rounded-2xl py-4 text-sm font-medium touch-manipulation",
                  "hover:opacity-95 active:scale-[0.98] transition-all"
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
