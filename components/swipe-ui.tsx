"use client"

import { motion, useMotionValue, useTransform, animate, type PanInfo } from "motion/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import {
  buildDemoSwipeProfiles,
  consumeDemoSwipeDeck,
  type SwipeProfile,
} from "@/lib/demo-profiles"
import { filterProfilesForUser } from "@/lib/swipe-gender-filter"
import { isLoggedIn } from "@/lib/user-profile"
import {
  getTimerMoodCardClass,
  getTimerMoodFromMs,
  parseTimeLeftToMs,
} from "@/lib/profile-timer-mood"
import { ProfileTimerMood } from "@/components/ui/profile-timer-mood"
import { cn } from "@/lib/utils"

const STACK_VISIBLE = 3

function SwipeCard({
  profile,
  stackIndex,
  isTop,
  onSwipe,
  likeText,
  nopeText,
}: {
  profile: SwipeProfile
  stackIndex: number
  isTop: boolean
  onSwipe: (direction: "left" | "right") => void
  likeText: string
  nopeText: string
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-8, 8])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])
  const mood = getTimerMoodFromMs(parseTimeLeftToMs(profile.timeLeft))
  const depth = stackIndex

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isTop) return
    if (info.offset.x > 100) {
      animate(x, 280, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
      setTimeout(() => onSwipe("right"), 220)
    } else if (info.offset.x < -100) {
      animate(x, -280, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
      setTimeout(() => onSwipe("left"), 220)
    } else {
      animate(x, 0, { duration: 0.5, ease: [0.22, 1, 0.36, 1] })
    }
  }

  const cardInner = (
    <div className={cn("cin-card h-full relative overflow-hidden rounded-[1.75rem]", getTimerMoodCardClass(mood))}>
      <div className="relative h-full min-h-[420px]">
        <Image
          src={profile.image}
          alt={isTop ? profile.name : ""}
          fill
          className="object-cover object-[center_10%]"
          draggable={false}
          sizes="340px"
          priority={isTop}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/30 to-transparent" />

        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-10 left-5 px-3 py-1.5 rounded-lg border border-white/25 bg-black/30 backdrop-blur-md -rotate-6 z-20"
            >
              <span className="text-white/90 text-sm font-light tracking-[0.2em] uppercase">{likeText}</span>
            </motion.div>

            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-10 right-5 px-3 py-1.5 rounded-lg border border-white/15 bg-black/30 backdrop-blur-md rotate-6 z-20"
            >
              <span className="text-white/55 text-sm font-light tracking-[0.2em] uppercase">{nopeText}</span>
            </motion.div>

            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
              <ProfileTimerMood profileId={profile.id} timeLeft={profile.timeLeft} live />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="text-3xl font-extralight text-white tracking-tight">
                {profile.name}
                <span className="text-white/45 text-2xl">, {profile.age}</span>
              </h3>
              <p className="text-white/40 text-xs font-light mt-2 tracking-wide">
                {profile.location} · {profile.distance}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )

  if (isTop) {
    return (
      <motion.div
        style={{ x, rotate, zIndex: 30 - depth }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {cardInner}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{
        scale: 1 - depth * 0.045,
        y: depth * 10,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 38 }}
      style={{ zIndex: 20 - depth }}
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden rounded-[1.75rem]",
        depth === 1 && "ttm-swipe-stack-breathe ttm-swipe-stack-delay-a",
        depth === 2 && "ttm-swipe-stack-breathe ttm-swipe-stack-delay-b"
      )}
    >
      {cardInner}
    </motion.div>
  )
}

export function SwipeUI() {
  const { t, locale, location } = useI18n()
  const demoMode = useRef(false)
  const [profiles, setProfiles] = useState<SwipeProfile[]>([])

  useEffect(() => {
    demoMode.current = consumeDemoSwipeDeck() || isLoggedIn()
    setProfiles(filterProfilesForUser(buildDemoSwipeProfiles(locale, location.position)))
  }, [locale, location.position])

  const handleSwipe = () => {
    setProfiles((prev) => prev.slice(1))
  }

  const handleButtonSwipe = (direction: "left" | "right") => {
    if (profiles.length === 0) return
    handleSwipe()
  }

  const stack = profiles.slice(0, STACK_VISIBLE)
  const remaining = profiles.length

  return (
    <section id="discover" className="relative py-20 md:py-32 px-5 sm:px-8 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-[480px] h-[480px] rounded-full bg-white/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="ttm-cin-headline text-balance mb-5">{t("swipeTitle")}</h2>
          <p className="ttm-cin-sub max-w-md mx-auto">{t("swipeSubtitle")}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[min(100%,340px)] aspect-[3/4.05]"
          >
            {stack.length > 0 ? (
              <>
                <div className="relative w-full h-full">
                  {[...stack].reverse().map((profile, reversedIdx) => {
                    const index = stack.length - 1 - reversedIdx
                    return (
                      <SwipeCard
                        key={`${locale}-${profile.id}-${profiles.length}`}
                        profile={profile}
                        stackIndex={index}
                        isTop={index === 0}
                        onSwipe={handleSwipe}
                        likeText={t("like")}
                        nopeText={t("nope")}
                      />
                    )
                  })}
                </div>
                {remaining > 1 && (
                  <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/35 font-extralight">
                    {t("remaining")} {remaining - 1}+
                  </p>
                )}
              </>
            ) : (
              <div className="cin-card h-full flex items-center justify-center min-h-[420px] rounded-[1.75rem]">
                <p className="ttm-cin-sub text-center px-6">{t("noMoreProfiles")}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex lg:flex-col gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleButtonSwipe("left")}
              className="w-14 h-14 rounded-full cin-glass flex items-center justify-center text-white/50 hover:text-white/80 transition-colors duration-500"
              aria-label={t("nope")}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleButtonSwipe("right")}
              className="w-16 h-16 rounded-full cin-btn-primary flex items-center justify-center text-white"
              aria-label={t("like")}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
