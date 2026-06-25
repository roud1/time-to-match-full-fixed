"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import { motion, animate } from "motion/react"
import { useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { recordSwipe } from "@/client/lib/social-store"
import { getPeerTrustSignals } from "@/client/lib/demo-trust-signals"
import { SafetyHubDialog } from "@/client/components/trust/safety-hub-dialog"
import { getUserProfile, isPremiumActive } from "@/client/lib/user-profile"
import { usePremiumUpgrade } from "@/client/components/premium/premium-upgrade-context"
import { CinematicParticles } from "@/client/components/ui/cinematic-particles"
import { SwipeProfileCard, type SwipeCardLabels } from "@/client/components/app/swipe-profile-card"
import { SwipeProfileDetailScreen } from "@/client/components/app/swipe-profile-detail-screen"
import { MatchCelebrationScreen } from "@/client/components/app/match-celebration-screen"
import { EmptyState } from "@/client/components/ui/empty-state"
import { isFirstMatchPending } from "@/client/lib/product-experience"
import { trackEvent } from "@/client/lib/analytics-client"
import { trackFunnelOnce } from "@/client/lib/analytics-funnel"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/client/components/ui/button"
import { useTopCardSwipe } from "@/client/hooks/use-top-card-swipe"
import { cn } from "@/client/lib/utils"
import { postDiscoverRewind } from "@/client/lib/discover/api"

const STACK_VISIBLE = 3

function SwipeDeckSkeleton({ centered, cardOnly }: { centered?: boolean; cardOnly?: boolean }) {
  const card = (
    <div className="ttm-swipe-card-shell relative w-full max-w-[min(100%,24rem)] h-full min-h-[18rem] max-h-full rounded-[20px] overflow-hidden bg-[#0a0406] border border-[rgba(255,241,242,0.06)] shadow-[0_24px_56px_-20px_rgba(190,18,60,0.22)]">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050208] via-transparent to-transparent opacity-90" />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="h-6 w-2/3 rounded-lg bg-[var(--border)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--border)] opacity-70" />
      </div>
    </div>
  )
  const actions = (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      {[48, 54, 48, 58].map((size, i) => (
        <div
          key={i}
          className="rounded-full bg-[var(--accent-soft-bg)] border border-[var(--border)]"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )

  if (cardOnly) {
    return (
      <div className="flex flex-1 min-h-0 w-full items-center justify-center animate-pulse" aria-busy aria-label="Loading">
        {card}
      </div>
    )
  }

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

export type SwipeDeckSlots = {
  card: ReactNode
  actions: ReactNode
  dialogs: ReactNode
}

type SwipeDeckProps = {
  profiles: SwipeProfile[]
  /** When false, show skeleton (initial load before profiles are set). */
  booted: boolean
  emptyReason?: "swiped" | "filters" | null
  onProfilesChange: (
    update: SwipeProfile[] | ((prev: SwipeProfile[]) => SwipeProfile[])
  ) => void
  onResetFilters?: () => void
  /** Place card in center grid column with balanced side gutters. */
  centered?: boolean
  /** Welcome-style layout: card only inline; actions rendered via children slot. */
  cardOnly?: boolean
  children?: (slots: SwipeDeckSlots) => ReactNode
}

export function SwipeDeck({
  profiles,
  booted,
  emptyReason = null,
  onProfilesChange,
  onResetFilters,
  centered,
  cardOnly = false,
  children,
}: SwipeDeckProps) {
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
  const xAnimRef = useRef<ReturnType<typeof animate> | null>(null)

  const current = profiles[0]
  const { x, rotate, likeOpacity, nopeOpacity } = useTopCardSwipe(current?.id)

  const cancelXAnim = useCallback(() => {
    const ctrl = xAnimRef.current
    if (ctrl && typeof ctrl.stop === "function") ctrl.stop()
    xAnimRef.current = null
  }, [])

  const flyOff = useCallback(
    async (direction: "left" | "right", superLike = false) => {
      const top = profiles[0]
      if (!top || exitLockRef.current) return
      exitLockRef.current = true
      cancelXAnim()

      const w = typeof window !== "undefined" ? window.innerWidth : 390
      const target = direction === "right" ? w * 1.35 : -w * 1.35

      try {
        if (reduceMotion) {
          xAnimRef.current = animate(x, target, { duration: 0.22, ease: [0.22, 1, 0.36, 1] })
        } else {
          xAnimRef.current = animate(x, target, { type: "spring", stiffness: 400, damping: 32 })
        }
        await xAnimRef.current

        const { matched, likeLimitReached } = await recordSwipe(
          top,
          direction,
          locale,
          location.position,
          superLike ? { superLike: true } : undefined
        )
        if (likeLimitReached) {
          openUpgrade("likes")
          x.set(0)
          return
        }
        trackEvent(direction === "right" ? "swipe_like" : "swipe_pass")
        trackFunnelOnce("first_swipe", { direction })
        if (matched && direction === "right") {
          setFirstMatchMode(isFirstMatchPending())
          setMatchedProfile(top)
        }

        lastRemovedRef.current = top
        setCanRewind(true)
        onProfilesChange((prev) => prev.filter((p) => p.id !== top.id))
        x.set(0)
      } catch {
        const { matched, likeLimitReached } = await recordSwipe(
          top,
          direction,
          locale,
          location.position,
          superLike ? { superLike: true } : undefined
        )
        if (likeLimitReached) {
          openUpgrade("likes")
          x.set(0)
          return
        }
        trackEvent(direction === "right" ? "swipe_like" : "swipe_pass")
        trackFunnelOnce("first_swipe", { direction })
        if (matched && direction === "right") {
          setFirstMatchMode(isFirstMatchPending())
          setMatchedProfile(top)
        }
        lastRemovedRef.current = top
        setCanRewind(true)
        onProfilesChange((prev) => prev.filter((p) => p.id !== top.id))
        x.set(0)
      } finally {
        exitLockRef.current = false
      }
    },
    [profiles, locale, location.position, onProfilesChange, reduceMotion, x, cancelXAnim, openUpgrade]
  )

  const onDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
    ) => {
      const { offset, velocity } = info
      const threshold = 88
      if (offset.x > threshold || velocity.x > 380) {
        void flyOff("right")
      } else if (offset.x < -threshold || velocity.x < -380) {
        void flyOff("left")
      } else {
        cancelXAnim()
        xAnimRef.current = animate(x, 0, { type: "spring", stiffness: 480, damping: 32, mass: 0.85 })
      }
    },
    [flyOff, x, cancelXAnim]
  )

  const rewind = useCallback(() => {
    const last = lastRemovedRef.current
    if (!last || !canRewind) return
    const user = getUserProfile()
    if (!user || !isPremiumActive(user)) {
      openUpgrade("rewind")
      return
    }
    const targetUserId = last.userId
    if (!targetUserId) return

    void postDiscoverRewind(targetUserId).then((res) => {
      if (!res.ok) {
        if ("premiumRequired" in res && res.premiumRequired) {
          openUpgrade("rewind")
        }
        return
      }
      onProfilesChange((prev) => [last, ...prev])
      lastRemovedRef.current = null
      setCanRewind(false)
    })
  }, [canRewind, onProfilesChange, openUpgrade])

  const superLike = useCallback(() => {
    const user = getUserProfile()
    if (!user || !isPremiumActive(user)) {
      openUpgrade("likes")
      return
    }
    setSuperRipple(true)
    setTimeout(() => setSuperRipple(false), 520)
    void flyOff("right", true)
  }, [flyOff, openUpgrade])

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

  const useWelcomeSlots = cardOnly || Boolean(children)

  if (!booted) {
    if (useWelcomeSlots && children) {
      return (
        <>
          {children({
            card: <SwipeDeckSkeleton cardOnly />,
            actions: null,
            dialogs: null,
          })}
        </>
      )
    }
    return <SwipeDeckSkeleton centered={centered} />
  }

  if (profiles.length === 0) {
    const filtersEmpty = emptyReason === "filters"
    const emptyState = (
      <div className="flex flex-1 items-center justify-center px-4 py-8 w-full min-h-[min(420px,50dvh)]">
        <EmptyState
          icon={Sparkles}
          title={filtersEmpty ? t("discoverEmptyFiltersTitle") : t("discoverEmptyAllSwipedTitle")}
          description={
            filtersEmpty ? t("discoverEmptyFiltersBody") : t("discoverEmptyAllSwipedBody")
          }
          className="max-w-sm w-full"
          action={
            filtersEmpty ? (
              <Button
                type="button"
                variant="default"
                className="rounded-full px-6"
                onClick={onResetFilters}
              >
                {t("discoverEmptyFiltersReset")}
              </Button>
            ) : (
              <Button asChild variant="default" className="rounded-full px-6">
                <Link href="/profile">{t("discoverEmptyCreateProfile")}</Link>
              </Button>
            )
          }
        />
      </div>
    )
    if (useWelcomeSlots && children) {
      return (
        <>
          {children({ card: emptyState, actions: null, dialogs: null })}
        </>
      )
    }
    return emptyState
  }

  const stack = profiles.slice(0, cardOnly ? 1 : STACK_VISIBLE)

  const actionButtons = (
    <div className="ttm-swipe-actions shrink-0 flex flex-row lg:flex-col items-center justify-center gap-2.5 sm:gap-3 lg:gap-4 py-1 lg:py-0 safe-area-pb lg:pb-2 relative z-40 pointer-events-auto w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        disabled={!canRewind}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={rewind}
        aria-label={t("swipeRewindAria")}
        className={cn(
          "ttm-swipe-action-btn ttm-swipe-action-btn--rewind relative h-11 w-11 sm:h-[52px] sm:w-[52px] rounded-full flex items-center justify-center touch-manipulation",
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
          "ttm-swipe-action-btn ttm-swipe-action-btn--nope h-[3.25rem] w-[3.25rem] sm:h-[58px] sm:w-[58px] lg:h-16 lg:w-16 rounded-full flex items-center justify-center touch-manipulation",
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
        onPointerDown={(e) => e.stopPropagation()}
        onClick={superLike}
        aria-label={t("swipeSuperLikeAria")}
        className={cn(
          "ttm-swipe-action-btn ttm-swipe-action-btn--super h-11 w-11 sm:h-[52px] sm:w-[52px] lg:h-14 lg:w-14 rounded-full flex items-center justify-center touch-manipulation",
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
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => void flyOff("right")}
        aria-label={t("like")}
        className={cn(
          "ttm-swipe-action-btn ttm-swipe-action-btn--like h-[3.5rem] w-[3.5rem] sm:h-16 sm:w-16 lg:h-[4.25rem] lg:w-[4.25rem] rounded-full flex items-center justify-center touch-manipulation",
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
    "ttm-swipe-card-shell relative w-full mx-auto shrink-0 h-full min-h-0",
    "max-w-[min(100%,22rem)] sm:max-w-[24rem] md:max-w-[26rem] lg:max-w-[28rem]",
    "max-h-full",
    "rounded-[var(--radius-lg)] overflow-hidden"
  )

  const renderStack = (layout: "stack" | "welcome") =>
    stack.length > 0 ? (
      <div
        className={cn(
          "ttm-swipe-deck-stack relative w-full mx-auto overflow-hidden rounded-[var(--radius-lg)]",
          layout === "welcome"
            ? "ttm-swipe-deck-stack--welcome min-h-[min(26rem,58dvh)] h-auto max-h-[min(calc(100dvh-var(--ttm-header-height,3rem)-var(--ttm-dock-height)-11rem),44rem)] overflow-y-auto"
            : "h-full min-h-0 max-h-full"
        )}
      >
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
              stackLayout={layout}
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
      <div className="min-h-[12rem] flex items-center justify-center px-6">
        <p className="text-muted-foreground font-light text-center text-sm leading-relaxed">{t("noMoreProfiles")}</p>
      </div>
    )

  const cardColumn = useWelcomeSlots ? (
    <div className="w-full min-w-0 flex flex-col flex-1 min-h-[min(26rem,58dvh)]">
      <div className="relative z-[1] w-full flex-1 flex flex-col min-h-0">{renderStack("welcome")}</div>
    </div>
  ) : (
    <div
      className={cn(
        "w-full min-w-0 max-h-full flex flex-col items-stretch justify-center",
        centered ? "self-stretch" : "flex-1 min-h-0"
      )}
    >
      <div
        className={cn(
          "w-full",
          !centered && "flex-1 flex items-center justify-center min-h-0",
          cardShellClass
        )}
      >
        {!cardOnly && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.18),transparent)]" />
            <CinematicParticles count={8} className="opacity-55" />
          </>
        )}
        {superRipple && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[25] rounded-[2rem] bg-gradient-to-br from-amber-400/20 via-transparent to-white/08"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.55 }}
          />
        )}

        <div className="relative z-[1] h-full w-full p-0.5 flex items-stretch justify-center min-h-0">
          {renderStack("stack")}
        </div>
      </div>
    </div>
  )

  const actionsWrapClass = centered
    ? "justify-self-start self-center pl-1 sm:pl-2"
    : "shrink-0"

  const dialogs = (
    <>
      <SafetyHubDialog
        open={safetyOpen}
        onOpenChange={setSafetyOpen}
        profileId={current?.id ?? 0}
        profileName={current?.name ?? ""}
        serverUserId={current?.userId}
        context="discover"
        onAfterBlock={() => {
          if (current) onProfilesChange((prev) => prev.filter((p) => p.id !== current.id))
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

  const cardSlot = (
    <div
      className={cn(
        "ttm-swipe-deck--card-only w-full flex flex-col items-stretch pointer-events-none",
        useWelcomeSlots ? "flex-1 min-h-[min(26rem,58dvh)]" : "min-h-0 justify-center",
        !useWelcomeSlots && centered && "ttm-swipe-deck col-span-3 flex-1"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto w-full flex flex-col min-w-0",
          useWelcomeSlots ? "flex-1 min-h-0" : "items-center justify-center min-h-0",
          !useWelcomeSlots && centered && "ttm-swipe-deck__card-slot lg:w-auto lg:flex-none"
        )}
      >
        {cardColumn}
      </div>
    </div>
  )

  if (useWelcomeSlots && children) {
    return (
      <>
        {children({
          card: cardSlot,
          actions: actionButtons,
          dialogs,
        })}
      </>
    )
  }

  if (centered) {
    return (
      <>
        {dialogs}
        <div className="ttm-swipe-deck col-span-3 w-full min-h-0 flex-1 flex flex-col items-stretch justify-center gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-8 xl:gap-10 pointer-events-none px-1 sm:px-2">
          <div className="ttm-swipe-deck__card-slot pointer-events-auto w-full lg:w-auto lg:flex-none flex flex-col items-center justify-center min-h-0 min-w-0">
            {cardColumn}
          </div>
          <div className="ttm-swipe-deck__actions-slot pointer-events-auto w-full lg:w-auto shrink-0 flex justify-center">
            {actionButtons}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-row flex-1 min-h-0 w-full gap-3 sm:gap-5 px-0.5 pb-safe ttm-swipe-deck--mobile-stack">
      {dialogs}
      {cardColumn}
      <div className={actionsWrapClass}>{actionButtons}</div>
    </div>
  )
}
