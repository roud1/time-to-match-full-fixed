"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, type MotionValue } from "motion/react"
import Image from "next/image"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { PeerTrustSignals } from "@/lib/demo-trust-signals"
import { demoMatchPercent } from "@/lib/swipe-match-score"
import { getSwipeProfilePhotos } from "@/lib/swipe-profile-photos"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { demoPeerPresence } from "@/lib/profile-life"

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
}: SwipeProfileCardProps) {
  const { t } = useI18n()
  const matchPct = demoMatchPercent(profile)
  const peerPresence = demoPeerPresence(profile.id)
  const photos = getSwipeProfilePhotos(profile)
  const [photoIndex, setPhotoIndex] = useState(0)
  const dragGuard = useDragGuard()
  const depth = stackIndex

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
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/15"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        aria-hidden
      />
    </>
  )

  const chromeLayer = isTop ? (
    <>
      {likeOpacity && nopeOpacity && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-[4.5rem] left-3 px-3 py-2 rounded-xl border-2 border-emerald-400/85 bg-emerald-500/[0.12] backdrop-blur-md -rotate-10 z-20"
          >
            <span className="text-emerald-200 text-sm font-medium tracking-[0.15em] uppercase">{labels.like}</span>
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-[4.5rem] right-3 px-3 py-2 rounded-xl border-2 border-rose-400/85 bg-rose-500/[0.12] backdrop-blur-md rotate-10 z-20"
          >
            <span className="text-rose-200 text-sm font-medium tracking-[0.15em] uppercase">{labels.nope}</span>
          </motion.div>
        </>
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
            className="absolute left-0 top-0 bottom-[36%] w-[30%] z-[6] touch-manipulation"
            aria-label={t("swipePhotoPrev")}
          />
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              if (!dragGuard.wasDragging()) goNextPhoto()
            }}
            className="absolute right-0 top-0 bottom-[36%] w-[30%] z-[6] touch-manipulation"
            aria-label={t("swipePhotoNext")}
          />
        </>
      )}

      <div className="absolute top-[1.65rem] left-2 right-2 z-10 flex items-center gap-1 pointer-events-auto min-w-0">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] backdrop-blur-md shrink-0 border",
            peerPresence === "active"
              ? "text-emerald-200/95 bg-black/40 border-emerald-500/30"
              : peerPresence === "recent"
                ? "text-emerald-100/75 bg-black/35 border-emerald-500/15"
                : "text-slate-300/80 bg-black/35 border-slate-500/20"
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            {peerPresence === "active" && !reduceMotion && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-1.5 w-1.5",
                peerPresence === "active"
                  ? "bg-emerald-400"
                  : peerPresence === "recent"
                    ? "bg-emerald-400/60"
                    : "bg-slate-400/70"
              )}
            />
          </span>
          {peerPresence === "active"
            ? t("lifePeerActiveNow")
            : peerPresence === "recent"
              ? t("lifePeerOnlineRecent")
              : t("lifePeerFading")}
        </span>

        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] bg-black/40 border border-white/10 backdrop-blur-md shrink-0 tabular-nums"
          title={`${labels.matchWord} ${matchPct}%`}
        >
          <span className="text-white">{matchPct}%</span>
        </span>

        {onOpenSafety && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onOpenSafety()
            }}
            className="w-7 h-7 shrink-0 ml-auto rounded-lg border border-white/12 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/85 hover:text-white touch-manipulation"
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

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          openProfileIfAllowed()
        }}
        className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-16 z-10 text-left touch-manipulation"
        aria-label={t("swipeProfileOpenAria")}
      >
        <div className="flex items-end justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg leading-tight font-extralight tracking-tight text-white drop-shadow-md truncate">
              {profile.name}
              <span className="text-white/60 font-light text-base">, {profile.age}</span>
            </h3>
            <p className="text-white/70 text-[10px] font-light mt-0.5 drop-shadow truncate">
              {profile.location} · {profile.distance}
            </p>
          </div>
          {peerPresence === "active" && (
            <span
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide border backdrop-blur-md",
                "border-pink-500/30 bg-black/35 text-pink-100/90",
                !reduceMotion && peerPresence === "active" && "ttm-swipe-urgency-pulse"
              )}
            >
              {labels.matchWord} ✦
            </span>
          )}
        </div>

        <p className="text-white/85 text-[11px] font-light leading-snug line-clamp-1 drop-shadow mt-1">
          {profile.bio}
        </p>

        <div className="flex items-center gap-2 mt-2 min-w-0 overflow-hidden">
          {trust && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] text-white/80 backdrop-blur-md">
              <span className="tabular-nums text-pink-200/95">{trust.score}</span>
              {trust.photoVerified && (
                <svg className="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              )}
            </span>
          )}
          {profile.interests.slice(0, 2).map((interest) => (
            <span
              key={interest}
              className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-light bg-black/35 text-white/85 border border-white/12 backdrop-blur-sm truncate max-w-[6rem]"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 2 && (
            <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-light text-white/55 border border-white/8">
              +{profile.interests.length - 2}
            </span>
          )}
        </div>
      </button>
    </>
  ) : null

  const shellClass = cn(
    "rounded-[1.85rem] overflow-hidden relative w-full h-full",
    "border border-white/[0.12] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)_inset]",
    "bg-neutral-950/80",
    isTop && peerPresence === "active" && "ttm-swipe-card-active",
    isTop && peerPresence === "fading" && "ttm-swipe-card-fading",
    stackClass
  )

  const depthOpacity = depth === 0 ? 1 : depth === 1 ? 0.88 : 0.72

  const cardBody = (
    <div className={shellClass} style={{ opacity: depthOpacity }}>
      <div className="relative w-full h-full aspect-[3/4.05] max-h-full">
        {photoLayer}
        {chromeLayer}
      </div>
    </div>
  )

  if (isTop) {
    return (
      <motion.div
        style={{ x, rotate, zIndex: 30 - depth, willChange: "transform" }}
        drag={onDragEnd ? "x" : false}
        dragElastic={0.14}
        dragConstraints={{ left: 0, right: 0 }}
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
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.85rem]"
    >
      {cardBody}
    </motion.div>
  )
}
