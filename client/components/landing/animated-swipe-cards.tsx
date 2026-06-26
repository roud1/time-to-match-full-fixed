"use client"

import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"

type SwipeProfile = {
  name: string
  age: number
  bio: string
  imageUrl: string
  timer: string
}

const PROFILES: SwipeProfile[] = [
  {
    name: "Emma",
    age: 26,
    bio: "Coffee, art galleries & spontaneous trips",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&h=600&fit=crop&q=85",
    timer: "23:41:08",
  },
  {
    name: "James",
    age: 28,
    bio: "Runner. Cook. Always up for a real chat",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=600&fit=crop&q=85",
    timer: "18:22:55",
  },
  {
    name: "Sofia",
    age: 24,
    bio: "Design nerd. Dog person. No small talk",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=600&fit=crop&q=85",
    timer: "11:07:33",
  },
]

const SWIPE_INTERVAL_MS = 3200

export function AnimatedSwipeCards() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [stamp, setStamp] = useState<"like" | "nope" | null>(null)

  const advance = useCallback(() => {
    setDirection(Math.random() > 0.35 ? 1 : -1)
    setStamp(Math.random() > 0.35 ? "like" : "nope")
    setIndex((i) => (i + 1) % PROFILES.length)
  }, [])

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(advance, SWIPE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [advance, reduce])

  useEffect(() => {
    if (!stamp) return
    const id = window.setTimeout(() => setStamp(null), 600)
    return () => window.clearTimeout(id)
  }, [stamp, index])

  const profile = PROFILES[index]
  const exitX = direction === 1 ? 320 : -320

  return (
    <div className="ttm-swipe-stack" aria-hidden>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={profile.name + index}
          className="ttm-swipe-card"
          initial={reduce ? false : { scale: 0.92, opacity: 0, rotate: direction * -4 }}
          animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
          exit={reduce ? { opacity: 0 } : { x: exitX, opacity: 0, rotate: direction * 18 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ttm-swipe-card__photo">
            <Image src={profile.imageUrl} alt="" fill sizes="320px" draggable={false} />
            <div className="ttm-swipe-card__shade" />
            <span className="ttm-swipe-card__timer">{profile.timer}</span>
            {stamp && (
              <motion.span
                className={`ttm-swipe-card__stamp ttm-swipe-card__stamp--${stamp === "like" ? "like" : "nope"}`}
                initial={{ scale: 0.6, opacity: 0, rotate: stamp === "like" ? -12 : 12 }}
                animate={{ scale: 1, opacity: 1, rotate: stamp === "like" ? -8 : 8 }}
                transition={{ duration: 0.25 }}
              >
                {stamp === "like" ? t("ttmLandingSwipeMatch") : t("ttmLandingSwipePass")}
              </motion.span>
            )}
          </div>
          <div className="ttm-swipe-card__body">
            <h3 className="ttm-swipe-card__name">
              {profile.name}, {profile.age}
            </h3>
            <p className="ttm-swipe-card__meta">{profile.bio}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
