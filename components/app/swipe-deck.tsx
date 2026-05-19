"use client"

import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "motion/react"
import Image from "next/image"
import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { recordSwipe } from "@/lib/social-store"

function SwipeCard({
  profile,
  onSwipe,
  isTop,
  stackIndex,
  likeText,
  nopeText,
  expiresLabel,
  onlineLabel,
}: {
  profile: SwipeProfile
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
  stackIndex: number
  likeText: string
  nopeText: string
  expiresLabel: string
  onlineLabel: string
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      animate(x, 300, { duration: 0.3 })
      setTimeout(() => onSwipe("right"), 200)
    } else if (info.offset.x < -100) {
      animate(x, -300, { duration: 0.3 })
      setTimeout(() => onSwipe("left"), 200)
    } else {
      animate(x, 0, { duration: 0.3 })
    }
  }

  return (
    <motion.div
      style={{ x, rotate, zIndex: isTop ? 20 : 10 - stackIndex }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{
        scale: isTop ? 1 : 1 - stackIndex * 0.04,
        y: isTop ? 0 : stackIndex * 8,
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
    >
      <div className="premium-profile-card rounded-[1.75rem] overflow-hidden h-full relative shadow-xl border border-white/10">
        <div className="relative h-full">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-6 px-4 py-2 rounded-2xl border-2 border-emerald-400/90 bg-emerald-500/10 backdrop-blur-md -rotate-12"
          >
            <span className="text-emerald-300 text-lg font-semibold tracking-[0.15em] uppercase">{likeText}</span>
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-10 right-6 px-4 py-2 rounded-2xl border-2 border-rose-400/90 bg-rose-500/10 backdrop-blur-md rotate-12"
          >
            <span className="text-rose-300 text-lg font-semibold tracking-[0.15em] uppercase">{nopeText}</span>
          </motion.div>

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-emerald-300 bg-black/40 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {onlineLabel}
            </span>
            <div className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-right">
              <p className="text-[9px] uppercase text-white/50">{expiresLabel}</p>
              <p className="text-xs text-pink-300 tabular-nums">{profile.timeLeft}</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-light text-white mb-1">
              {profile.name}, {profile.age}
            </h3>
            <p className="text-white/70 text-sm font-light mb-3">
              {profile.location} · {profile.distance}
            </p>
            <p className="text-white/80 font-light mb-4 line-clamp-2">{profile.bio}</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full text-xs font-light bg-white/10 text-white/90 border border-white/20"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

type SwipeDeckProps = {
  profiles: SwipeProfile[]
  onProfilesChange: (profiles: SwipeProfile[]) => void
}

export function SwipeDeck({ profiles, onProfilesChange }: SwipeDeckProps) {
  const { t, locale, location } = useI18n()
  const [matchFlash, setMatchFlash] = useState<string | null>(null)

  const handleSwipe = (direction: "left" | "right") => {
    const current = profiles[0]
    if (!current) return

    const { matched } = recordSwipe(current, direction, locale, location.position)
    if (matched) {
      setMatchFlash(current.name)
      setTimeout(() => setMatchFlash(null), 2800)
    }

    onProfilesChange(profiles.slice(1))
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[380px] mx-auto">
      <AnimatePresence>
        {matchFlash && (
          <motion.div
            key="match"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full rounded-2xl border border-pink-500/40 bg-gradient-to-r from-pink-500/20 to-purple-600/15 px-4 py-3 text-center text-sm font-light text-pink-200 shadow-lg shadow-pink-500/10"
          >
            {t("matchFlash")} {matchFlash}!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full aspect-[3/4]">
        {profiles.length > 0 ? (
          profiles
            .map((profile, index) => (
              <SwipeCard
                key={`${locale}-${profile.id}`}
                profile={profile}
                onSwipe={handleSwipe}
                isTop={index === 0}
                stackIndex={index}
                likeText={t("like")}
                nopeText={t("nope")}
                expiresLabel={t("profileExpiresIn")}
                onlineLabel={t("profileOnline")}
              />
            ))
            .reverse()
        ) : (
          <div className="glass-card rounded-3xl h-full flex items-center justify-center">
            <p className="text-muted-foreground font-light px-6 text-center">{t("noMoreProfiles")}</p>
          </div>
        )}
      </div>

      <div className="flex gap-8">
        <button
          type="button"
          onClick={() => profiles[0] && handleSwipe("left")}
          className="w-16 h-16 rounded-full glass flex items-center justify-center text-red-400 hover:bg-red-500/15 border border-red-500/20 transition-colors touch-manipulation active:scale-95"
          aria-label={t("nope")}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => profiles[0] && handleSwipe("right")}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 border border-pink-400/30 touch-manipulation active:scale-95"
          aria-label={t("like")}
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
