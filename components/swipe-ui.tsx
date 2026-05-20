"use client"

import { motion, useMotionValue, useTransform, animate, PanInfo } from "motion/react"
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

function SwipeCard({ 
  profile, 
  onSwipe, 
  isTop,
  likeText,
  nopeText,
  remainingText,
}: { 
  profile: {
    id: number
    name: string
    age: number
    location: string
    distance: string
    image: string
    timeLeft: string
    bio: string
    interests: string[]
  }
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
  likeText: string
  nopeText: string
  remainingText: string
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
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <motion.div className="glass-card rounded-3xl overflow-hidden h-full relative">
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
            className="absolute top-8 left-8 px-4 py-2 rounded-xl border-4 border-green-500 rotate-[-20deg]"
          >
            <span className="text-green-500 text-2xl font-bold tracking-wider">{likeText}</span>
          </motion.div>

          <motion.div 
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 right-8 px-4 py-2 rounded-xl border-4 border-red-500 rotate-[20deg]"
          >
            <span className="text-red-500 text-2xl font-bold tracking-wider">{nopeText}</span>
          </motion.div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-sm font-light tabular-nums text-foreground/90">
                {remainingText} {profile.timeLeft}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-light text-white mb-1">
                {profile.name}, {profile.age}
              </h3>
              <p className="text-sm text-white/60 font-light flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location} · {profile.distance}
              </p>
            </div>
            
            <p className="text-white/80 font-light mb-4">{profile.bio}</p>
            
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-light bg-white/10 text-white/80"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
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

  const handleSwipe = (direction: "left" | "right") => {
    console.log(`Swiped ${direction}`)
    setProfiles((prev) => prev.slice(1))
  }

  const handleButtonSwipe = (direction: "left" | "right") => {
    if (profiles.length === 0) return
    handleSwipe(direction)
  }

  return (
    <section id="discover" className="relative py-24 px-4 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mb-4 text-balance">
            {t("swipeTitle")}
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            {t("swipeSubtitle")}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-[340px] aspect-[3/4]"
          >
            {profiles.length > 0 ? (
              profiles.map((profile, index) => (
                <SwipeCard
                  key={`${locale}-${profile.id}`}
                  profile={profile}
                  onSwipe={handleSwipe}
                  isTop={index === 0}
                  likeText={t("like")}
                  nopeText={t("nope")}
                  remainingText={t("remaining")}
                />
              )).reverse()
            ) : (
              <div className="glass-card rounded-3xl h-full flex items-center justify-center">
                <div className="text-center p-6">
                  <motion.div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </motion.div>
                  <p className="text-muted-foreground font-light">
                    {t("noMoreProfiles")}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex lg:flex-col gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonSwipe("left")}
              className="w-16 h-16 rounded-full glass flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonSwipe("right")}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
