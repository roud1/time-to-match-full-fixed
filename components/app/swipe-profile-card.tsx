"use client"

import { useEffect, useRef, useState } from "react"
import { useSwipeable } from "react-swipeable"
import { motion, AnimatePresence, type MotionValue } from "motion/react"
import Image from "next/image"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { PeerTrustSignals } from "@/lib/demo-trust-signals"
import { computeDiscoverCompatibility } from "@/lib/discover-compatibility"
import { InterestCompatibilityStrip } from "@/components/discover/interest-compatibility-strip"
import { SwipeProfileExpiryChip } from "@/components/discover/swipe-profile-expiry-chip"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { getSwipeProfilePhotos } from "@/lib/swipe-profile-photos"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { demoPeerPresence } from "@/lib/profile-life"
import { resolveEmotionalPresence } from "@/lib/world"
import { PresenceEmotionalPill } from "@/components/presence/presence-emotional-pill"
import { getTimerMoodCardClass, getTimerMoodFromMs, parseTimeLeftToMs } from "@/lib/profile-timer-mood"

function useDragGuard() {
  const wasDragging = useRef(false)

  return {
    onDragStart: () => {
      wasDragging.current = false
    },
    onDrag: (_: unknown, info: { offset: { x: number } }) => {
      if (Math.abs(info.offset.x) > 6) wasDragging.current = true
    },
    wasDragging: () => wasDragging.current,
  }
}

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
  onOpenProfile,
  onDragEnd,
  onSwipeLeft,
  onSwipeRight,
}: SwipeProfileCardProps) {
  const { t } = useI18n()
  const photoVerified = profile.photoVerified === true
  const compatibility = computeDiscoverCompatibility(profile)
  const matchPct = compatibility.resonancePercent
  const emotionalPresence = resolveEmotionalPresence(profile.id)
  const peerPresence = demoPeerPresence(profile.id)
  const timerMood = getTimerMoodFromMs(parseTimeLeftToMs(profile.timeLeft))
  const photos = getSwipeProfilePhotos(profile)
  const [photoIndex, setPhotoIndex] = useState(0)
  const dragGuard = useDragGuard()
  const depth = stackIndex

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    trackTouch: true,
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 50,
    swipeDuration: 500,
  })

  useEffect(() => {
    setPhotoIndex(0)
  }, [profile.id])

  const safePhotoIndex = Math.min(photoIndex, Math.max(photos.length - 1, 0))
  const activePhoto = photos[safePhotoIndex] ?? profile.image

  const goPrevPhoto = () => setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  const goNextPhoto = () => setPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1))

  const openProfileIfAllowed = () => {
    if (dragGuard.wasDragging()) return
    onOpenProfile?.(safePhotoIndex)
  }
  const stackClass =
    !isTop && !reduceMotion
      ? depth === 1
        ? "ttm-swipe-stack-breathe ttm-swipe-stack-delay-a"
        : depth === 2
          ? "ttm-swipe-stack-breathe ttm-swipe-stack-delay-b"
          : ""
      : ""

  const photoLayer = (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isTop ? `${profile.id}-${safePhotoIndex}` : profile.id}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0.85 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Image
            src={isTop ? activePhoto : photos[0]}
            alt=""
            fill
            className="object-cover object-[center_15%] select-none pointer-events-none"
            sizes="(max-width: 768px) 100vw, 420px"
            priority={isTop}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/10"
        aria-hidden
      />
    </>
  )

  const photoChrome = isTop ? (
    <>
      {likeOpacity && nopeOpacity && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-[4.5rem] left-3 px-3 py-2 rounded-xl border border-white/25 bg-white/[0.08] backdrop-blur-md -rotate-6 z-20"
          >
            <span className="text-white/90 text-xs font-extralight tracking-[0.14em] uppercase">{labels.like}</span>
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-[4.5rem] right-3 px-3 py-2 rounded-xl border border-white/12 bg-black/30 backdrop-blur-md rotate-6 z-20"
          >
            <span className="text-white/45 text-xs font-extralight tracking-[0.14em] uppercase">{labels.nope}</span>
          </motion.div>
        </>
      )}

      {photoVerified && (
        <div className="absolute top-2 right-2.5 z-[12] pointer-events-none">
          <VerifiedBadge size={16} title={t("photoVerifiedLabel")} />
        </div>
      )}

      {photos.length > 1 && (
        <div className="absolute top-2 left-2.5 right-2.5 z-[11] flex gap-1 pointer-events-none">
          {photos.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-200",
                i === safePhotoIndex ? "bg-white" : "bg-white/35"
              )}
              aria-hidden
            />
          ))}
        </div>
      )}

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              if (!dragGuard.wasDragging()) goPrevPhoto()
            }}
            className="absolute left-0 top-0 bottom-0 w-[30%] z-[6] touch-manipulation"
            aria-label={t("swipePhotoPrev")}
          />
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              if (!dragGuard.wasDragging()) goNextPhoto()
            }}
            className="absolute right-0 top-0 bottom-0 w-[30%] z-[6] touch-manipulation"
            aria-label={t("swipePhotoNext")}
          />
        </>
      )}

      <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-1.5 pointer-events-auto min-w-0">
        <PresenceEmotionalPill presence={emotionalPresence} compact className="shrink-0" />

        {isTop && (
          <SwipeProfileExpiryChip
            profileId={profile.id}
            timeLeft={profile.timeLeft}
            live
            className="shrink-0"
          />
        )}

        {onOpenSafety && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onOpenSafety()
            }}
            className="w-7 h-7 shrink-0 ml-auto rounded-lg border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/75 hover:text-white touch-manipulation"
            aria-label={labels.safetyAria}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              />
            </svg>
          </button>
        )}
      </div>
    </>
  ) : null

  const infoPanel = isTop ? (
    <div className="discover-card__info">
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          openProfileIfAllowed()
        }}
        className="w-full text-left touch-manipulation"
        aria-label={t("swipeProfileOpenAria")}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg leading-tight font-extralight tracking-tight text-white truncate flex items-center gap-1.5">
              <span className="truncate">{profile.name}</span>
              {photoVerified && (
                <VerifiedBadge size={16} title={t("photoVerifiedLabel")} className="shrink-0" />
              )}
              <span className="text-white/60 font-light text-sm shrink-0">, {profile.age}</span>
            </h3>
            <p className="text-white/65 text-[10px] font-light mt-0.5 truncate">
              {profile.location} · {profile.distance}
            </p>
            <InterestCompatibilityStrip profile={profile} compact className="mt-1.5" />
          </div>
          {emotionalPresence.kind === "energy_active" ||
          emotionalPresence.kind === "emotionally_present" ||
          emotionalPresence.kind === "sync_active_tonight" ? (
            <span
              className={cn(
                "shrink-0 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide border",
                "border-white/15 bg-white/10 text-white/90",
                !reduceMotion && "ttm-swipe-urgency-pulse"
              )}
            >
              {labels.matchWord} ✦
            </span>
          ) : null}
        </div>

        <p className="text-white/80 text-[10px] sm:text-[11px] font-light leading-snug line-clamp-2 mt-1.5">
          {profile.bio}
        </p>

        {trust && (
          <div className="flex items-center gap-2 mt-2 min-w-0 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[9px] text-white/75">
              <span className="tabular-nums">{trust.score}</span>
              {trust.photoVerified && (
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              )}
            </span>
          </div>
        )}
      </button>
    </div>
  ) : null

  const shellClass = cn(
    "discover-card cin-card overflow-hidden relative w-full h-full",
    getTimerMoodCardClass(timerMood),
    isTop && "discover-card--top",
    isTop && peerPresence === "active" && "ttm-swipe-card-active",
    isTop && peerPresence === "fading" && "ttm-swipe-card-fading",
    stackClass
  )

  const depthOpacity = depth === 0 ? 1 : depth === 1 ? 0.88 : 0.72

  const cardBody = (
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
        <div className={cn("discover-card__photo", !isTop && "!flex-[1]")}>
          {photoLayer}
          {photoChrome}
        </div>
        {infoPanel}
      </div>
    </div>
  )

  if (isTop) {
    return (
      <motion.div
        {...swipeHandlers}
        style={{ x, rotate, zIndex: 30 - depth, willChange: "transform" }}
        drag={onDragEnd ? "x" : false}
        dragElastic={0.22}
        dragTransition={{ bounceStiffness: 380, bounceDamping: 28, power: 0.28 }}
        dragConstraints={false}
        onDragStart={dragGuard.onDragStart}
        onDrag={dragGuard.onDrag}
        onDragEnd={onDragEnd}
        className={cn(
          "absolute inset-0 touch-pan-y",
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
