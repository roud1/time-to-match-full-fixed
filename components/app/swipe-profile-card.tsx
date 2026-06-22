"use client"

import { useSwipeable } from "react-swipeable"
import { motion, type MotionValue } from "motion/react"
import { ProfilePhotoImage } from "@/components/ui/profile-photo-image"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { PeerTrustSignals } from "@/lib/demo-trust-signals"
import { computeDiscoverCompatibility } from "@/lib/discover-compatibility"
import { SwipeProfilePresenceCard } from "@/components/discover/swipe-profile-presence-card"
import { getSwipeProfilePhotos } from "@/lib/swipe-profile-photos"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { demoPeerPresence } from "@/lib/profile-life"
import { getTimerMoodCardClass, getTimerMoodFromMs, parseTimeLeftToMs } from "@/lib/profile-timer-mood"

export type SwipeCardLabels = {
  like: string
  nope: string
  expiresLabel: string
  onlineLabel: string
  matchWord: string
  expiresSoon: string
  trustShort: string
  trustVerified: string
  trustReview: string
  safetyAria: string
}

type SwipeProfileCardProps = {
  profile: SwipeProfile
  stackIndex: number
  isTop: boolean
  labels: SwipeCardLabels
  reduceMotion: boolean | null
  x?: MotionValue<number>
  rotate?: MotionValue<number>
  likeOpacity?: MotionValue<number>
  nopeOpacity?: MotionValue<number>
  trust?: PeerTrustSignals
  onOpenSafety?: () => void
  onOpenProfile?: (photoIndex: number) => void
  onDragEnd?: (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  /** Welcome / discover ritual: card flows in column (not absolute stack). */
  stackLayout?: "stack" | "welcome"
}

export function SwipeProfileCard({
  profile,
  stackIndex,
  isTop,
  labels,
  reduceMotion,
  x,
  rotate,
  likeOpacity,
  nopeOpacity,
  trust,
  onOpenSafety,
  onDragEnd,
  onSwipeLeft,
  onSwipeRight,
  stackLayout = "stack",
}: SwipeProfileCardProps) {
  const photos = getSwipeProfilePhotos(profile)
  const depth = stackIndex
  const compatibility = computeDiscoverCompatibility(profile)
  const matchPct = compatibility.resonancePercent
  const peerPresence = demoPeerPresence(profile.id)
  const timerMood = getTimerMoodFromMs(parseTimeLeftToMs(profile.timeLeft))

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    trackTouch: !onDragEnd,
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50,
    swipeDuration: 500,
  })

  const stackClass =
    !isTop && !reduceMotion
      ? depth === 1
        ? "ttm-swipe-stack-breathe ttm-swipe-stack-delay-a"
        : depth === 2
          ? "ttm-swipe-stack-breathe ttm-swipe-stack-delay-b"
          : ""
      : ""

  const shellClass = cn(
    "discover-card cin-card overflow-hidden relative w-full h-full",
    getTimerMoodCardClass(timerMood),
    stackClass
  )

  const depthOpacity = depth === 0 ? 1 : depth === 1 ? 0.88 : 0.72

  const cardBody = isTop ? (
    <SwipeProfilePresenceCard
      profile={profile}
      labels={labels}
      trust={trust}
      likeOpacity={likeOpacity}
      nopeOpacity={nopeOpacity}
      onOpenSafety={onOpenSafety}
      className={cn(
        getTimerMoodCardClass(timerMood),
        peerPresence === "active" && "ttm-swipe-card-active",
        peerPresence === "fading" && "ttm-swipe-card-fading"
      )}
    />
  ) : (
    <CompactStackCard profile={profile} shellClass={shellClass} compatibility={compatibility} matchPct={matchPct} depthOpacity={depthOpacity} photos={photos} />
  )

  if (isTop) {
    const welcomeFlow = stackLayout === "welcome"
    return (
      <motion.div
        {...swipeHandlers}
        style={{ x, rotate, zIndex: 30 - depth, willChange: welcomeFlow ? undefined : "transform" }}
        drag={onDragEnd ? "x" : false}
        dragElastic={0.22}
        dragTransition={{ bounceStiffness: 380, bounceDamping: 28, power: 0.28 }}
        dragConstraints={false}
        onDragEnd={onDragEnd}
        className={cn(
          welcomeFlow ? "relative w-full touch-pan-y" : "absolute inset-0 touch-pan-y",
          onDragEnd && "cursor-grab active:cursor-grabbing"
        )}
      >
        {cardBody}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{
        scale: 1 - depth * 0.04,
        y: depth * 8,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
      style={{ zIndex: 20 - depth, willChange: "transform" }}
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-[var(--radius-lg)]"
    >
      {cardBody}
    </motion.div>
  )
}

function CompactStackCard({
  profile,
  shellClass,
  compatibility,
  matchPct,
  depthOpacity,
  photos,
}: {
  profile: SwipeProfile
  shellClass: string
  compatibility: ReturnType<typeof computeDiscoverCompatibility>
  matchPct: number
  depthOpacity: number
  photos: string[]
}) {
  return (
    <div
      className={shellClass}
      data-atmosphere={compatibility.atmosphere}
      style={{
        opacity: depthOpacity,
        ["--discover-resonance" as string]: matchPct / 100,
      }}
    >
      <span className="discover-card__aura" aria-hidden />
      <div className="discover-card__layout">
        <div className="discover-card__photo !flex-[1]">
          <ProfilePhotoImage
            src={photos[0] ?? profile.image}
            className="object-cover object-[center_18%] select-none pointer-events-none"
            sizes="320px"
          />
          <div className="discover-card__photo-scrim absolute inset-0 pointer-events-none" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 p-3 z-[2]">
            <p className="discover-card__name text-base font-medium truncate">
              {profile.name}, {profile.age}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
