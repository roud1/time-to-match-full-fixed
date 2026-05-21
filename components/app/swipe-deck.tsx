"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, animate, type PanInfo } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { recordSwipe } from "@/lib/social-store"
import { getPeerTrustSignals } from "@/lib/demo-trust-signals"
import { SafetyHubDialog } from "@/components/trust/safety-hub-dialog"
import { getUserProfile, isPremiumActive } from "@/lib/user-profile"
import { usePremiumUpgrade } from "@/components/premium/premium-upgrade-context"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { SwipeProfileCard, type SwipeCardLabels } from "@/components/app/swipe-profile-card"
import { SwipeProfileDetailScreen } from "@/components/app/swipe-profile-detail-screen"
import { MatchCelebrationScreen } from "@/components/app/match-celebration-screen"
import { EmotionalEmptyState } from "@/components/product/emotional-empty-state"
import { isFirstMatchPending } from "@/lib/product-experience"
import { Sparkles } from "lucide-react"
import { useTopCardSwipe } from "@/hooks/use-top-card-swipe"
import { cn } from "@/lib/utils"

const STACK_VISIBLE = 3

function SwipeDeckSkeleton({ centered }: { centered?: boolean }) {
  const card = (
    <div className="relative w-[min(88vw,22rem)] sm:w-[21rem] md:w-[24rem] aspect-[3/4.05] max-h-full rounded-[1.85rem] overflow-hidden bg-white/[0.04] border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-white/5 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="h-6 w-2/3 rounded-lg bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/8" />
      </div>
    </div>
  )
  const actions = (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      {[48, 54, 48, 58].map((size, i) => (
        <div
          key={i}
          className="rounded-full bg-white/[0.06] border border-white/10"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )

  if (centered) {
    return (
      <>
        <div className="col-start-2 row-start-1 justify-self-center animate-pulse" aria-busy aria-label="Loading">
          {card}
        </div>
        <div className="col-start-3 row-start-1 justify-self-start self-center pl-1 sm:pl-2 animate-pulse">
          {actions}
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-row flex-1 min-h-0 w-full gap-2 sm:gap-4 animate-pulse pb-safe" aria-busy aria-label="Loading">
      <div className="flex-1 min-w-0 flex items-center justify-center">{card}</div>
      {actions}
    </div>
  )
}

type SwipeDeckProps = {
  profiles: SwipeProfile[]
  /** When false, show skeleton (initial load before profiles are set). */
  booted: boolean
  onProfilesChange: (profiles: SwipeProfile[]) => void
  /** Place card in center grid column with balanced side gutters. */
  centered?: boolean
}

export function SwipeDeck({ profiles, booted, onProfilesChange, centered }: SwipeDeckProps) {
  const { t, locale, location } = useI18n()
  const { openUpgrade } = usePremiumUpgrade()
  const reduceMotion = useReducedMotion()
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null)
  const [firstMatchMode, setFirstMatchMode] = useState(false)
  const [detailProfile, setDetailProfile] = useState<SwipeProfile | null>(null)
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0)
  const [superRipple, setSuperRipple] = useState(false)
  const [canRewind, setCanRewind] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const lastRemovedRef = useRef<SwipeProfile | null>(null)
  const exitLockRef = useRef(false)

  const current = profiles[0]
  const { x, rotate, likeOpacity, nopeOpacity } = useTopCardSwipe(current?.id)

  const flyOff = useCallback(
    async (direction: "left" | "right") => {
      const top = profiles[0]
      if (!top || exitLockRef.current) return
      exitLockRef.current = true
      const w = typeof window !== "undefined" ? window.innerWidth : 390
      const target = direction === "right" ? w * 1.35 : -w * 1.35

      try {
        if (reduceMotion) {
          await animate(x, target, { duration: 0.22, ease: [0.22, 1, 0.36, 1] })
        } else {
          await animate(x, target, { type: "spring", stiffness: 400, damping: 32 })
        }

        const { matched } = recordSwipe(top, direction, locale, location.position)
        if (matched && direction === "right") {
          setFirstMatchMode(isFirstMatchPending())
          setMatchedProfile(top)
        }

        lastRemovedRef.current = top
        setCanRewind(true)
        onProfilesChange(profiles.slice(1))
        x.set(0)
      } finally {
        exitLockRef.current = false
      }
    },
    [profiles, locale, location.position, onProfilesChange, reduceMotion, x]
  )

  const onDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info
      const threshold = 88
      if (offset.x > threshold || velocity.x > 380) {
        void flyOff("right")
      } else if (offset.x < -threshold || velocity.x < -380) {
        void flyOff("left")
      } else {
        void animate(x, 0, { type: "spring", stiffness: 480, damping: 32, mass: 0.85 })
      }
    },
    [flyOff, x]
  )

  const rewind = useCallback(() => {
    const last = lastRemovedRef.current
    if (!last || !canRewind) return
    const user = getUserProfile()
    if (!user || !isPremiumActive(user)) {
      openUpgrade("rewind")
      return
    }
    onProfilesChange([last, ...profiles])
    lastRemovedRef.current = null
    setCanRewind(false)
  }, [canRewind, onProfilesChange, profiles, openUpgrade])

  const superLike = useCallback(() => {
    setSuperRipple(true)
    setTimeout(() => setSuperRipple(false), 520)
    void flyOff("right")
  }, [flyOff])

  const labels: SwipeCardLabels = {
    like: t("discoverConnectLabel"),
    nope: t("discoverPassLabel"),
    expiresLabel: t("profileExpiresIn"),
    onlineLabel: t("profileOnline"),
    matchWord: t("swipeMatchWord"),
    expiresSoon: t("swipeExpiresSoon"),
    trustShort: t("trustPeerShort"),
    trustVerified: t("trustPeerVerified"),
    trustReview: t("trustPeerReview"),
    safetyAria: t("trustSafetyOpenAria"),
  }

  if (!booted) {
    return <SwipeDeckSkeleton centered={centered} />
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <EmotionalEmptyState
          title={t("discoverEmptyTitle")}
          body={t("discoverEmptyBody")}
          icon={Sparkles}
          className="max-w-sm w-full"
        />
      </div>
    )
  }

  const stack = profiles.slice(0, STACK_VISIBLE)

  const actionButtons = (
    <div className="shrink-0 flex flex-col items-center justify-center gap-3 sm:gap-4 py-2 safe-area-pb">
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        disabled={!canRewind}
        onClick={rewind}
        aria-label={t("swipeRewindAria")}
        className={cn(
          "relative h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] rounded-full flex items-center justify-center touch-manipulation transition-colors",
          "border border-white/15 bg-white/[0.06] backdrop-blur-xl text-amber-200/90",
          "shadow-[0_0_28px_-8px_rgba(251,191,36,0.25)]",
          !canRewind && "opacity-35 pointer-events-none"
        )}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        disabled={!current}
        onClick={() => void flyOff("left")}
        aria-label={t("nope")}
        className={cn(
          "h-[54px] w-[54px] sm:h-[58px] sm:w-[58px] rounded-full flex items-center justify-center touch-manipulation",
          "border border-rose-500/35 bg-rose-500/[0.12] backdrop-blur-xl text-rose-300",
          "shadow-[0_12px_40px_-12px_rgba(244,63,94,0.45)] active:scale-95 transition-transform",
          !current && "opacity-40 pointer-events-none"
        )}
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        disabled={!current}
        onClick={superLike}
        aria-label={t("swipeSuperLikeAria")}
        className={cn(
          "h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] rounded-full flex items-center justify-center touch-manipulation",
          "border border-sky-400/40 bg-sky-500/15 backdrop-blur-xl text-sky-200",
          "shadow-[0_0_32px_-6px_rgba(56,189,248,0.4)] active:scale-95 transition-transform",
          !current && "opacity-40 pointer-events-none"
        )}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
        </svg>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        disabled={!current}
        onClick={() => void flyOff("right")}
        aria-label={t("like")}
        className={cn(
          "h-[58px] w-[58px] sm:h-[64px] sm:w-[64px] rounded-full flex items-center justify-center touch-manipulation text-white",
          "bg-gradient-to-br cin-action-like border border-white/14",
          "shadow-[0_16px_48px_-8px_rgba(255,255,255,0.55)] active:scale-95 transition-transform",
          !current && "opacity-40 pointer-events-none"
        )}
      >
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.button>
    </div>
  )

  const cardShellClass = cn(
    "relative w-[min(88vw,22rem)] sm:w-[21rem] md:w-[24rem] aspect-[3/4.05] max-h-full rounded-[2rem] overflow-hidden",
    "bg-gradient-to-b from-white/[0.07] via-transparent to-white/[0.06]",
    "ring-1 ring-white/[0.06] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
  )

  const cardColumn = (
    <div className={cn(centered ? "col-start-2 row-start-1 justify-self-center self-center max-h-full" : "flex-1 min-w-0 flex flex-col min-h-0 items-center justify-center max-h-full")}>
      <div className={cn(!centered && "flex-1 flex items-center justify-center max-h-full", cardShellClass)}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.18),transparent)]" />
        <CinematicParticles count={8} className="opacity-55" />
        {superRipple && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[25] rounded-[2rem] bg-gradient-to-br from-amber-400/20 via-transparent to-white/08"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.55 }}
          />
        )}

        <div className="relative z-[1] h-full w-full p-1 flex items-center justify-center">
          {stack.length > 0 ? (
            <div className="relative w-full h-full max-h-full aspect-[3/4.05] mx-auto">
              {[...stack].reverse().map((profile, reversedIdx) => {
                const index = stack.length - 1 - reversedIdx
                const isTop = index === 0
                return (
                  <SwipeProfileCard
                    key={`${locale}-${profile.id}-${profiles.length}`}
                    profile={profile}
                    stackIndex={index}
                    isTop={isTop}
                    labels={labels}
                    reduceMotion={reduceMotion}
                    trust={getPeerTrustSignals(profile.id)}
                    onOpenSafety={isTop ? () => setSafetyOpen(true) : undefined}
                    onOpenProfile={
                      isTop
                        ? (photoIndex) => {
                            setDetailPhotoIndex(photoIndex)
                            setDetailProfile(profile)
                          }
                        : undefined
                    }
                    x={isTop ? x : undefined}
                    rotate={isTop ? rotate : undefined}
                    likeOpacity={isTop ? likeOpacity : undefined}
                    nopeOpacity={isTop ? nopeOpacity : undefined}
                    onDragEnd={isTop ? onDragEnd : undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center px-6">
              <p className="text-muted-foreground font-light text-center text-sm leading-relaxed">{t("noMoreProfiles")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const actionsWrapClass = centered
    ? "col-start-3 row-start-1 justify-self-start self-center pl-1 sm:pl-2"
    : "shrink-0"

  const dialogs = (
    <>
      <SafetyHubDialog
        open={safetyOpen}
        onOpenChange={setSafetyOpen}
        profileId={current?.id ?? 0}
        profileName={current?.name ?? ""}
        context="discover"
        onAfterBlock={() => {
          if (profiles.length > 0) onProfilesChange(profiles.slice(1))
        }}
      />
      <SwipeProfileDetailScreen
        profile={detailProfile}
        initialPhotoIndex={detailPhotoIndex}
        trust={detailProfile ? getPeerTrustSignals(detailProfile.id) : undefined}
        onClose={() => setDetailProfile(null)}
        onLike={() => void flyOff("right")}
        onNope={() => void flyOff("left")}
        onOpenSafety={() => {
          setDetailProfile(null)
          setSafetyOpen(true)
        }}
      />
      <MatchCelebrationScreen
        profile={matchedProfile}
        isFirstMatch={firstMatchMode}
        onClose={() => {
          setMatchedProfile(null)
          setFirstMatchMode(false)
        }}
      />
    </>
  )

  if (centered) {
    return (
      <>
        {dialogs}
        {cardColumn}
        <div className={actionsWrapClass}>{actionButtons}</div>
      </>
    )
  }

  return (
    <div className="flex flex-row flex-1 min-h-0 w-full gap-3 sm:gap-5 px-0.5 pb-safe">
      {dialogs}
      {cardColumn}
      <div className={actionsWrapClass}>{actionButtons}</div>
    </div>
  )
}
