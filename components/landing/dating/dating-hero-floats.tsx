"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { cn } from "@/lib/utils"

const FLOAT_LAYOUT = [
  { className: "ttm-dating-float--left", delay: 0.15, y: 12 },
  { className: "ttm-dating-float--center", delay: 0.28, y: 0 },
  { className: "ttm-dating-float--right", delay: 0.4, y: 16 },
] as const

export function DatingHeroFloats() {
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()

  return (
    <div className="ttm-dating-hero__floats" aria-hidden>
      {FLOAT_LAYOUT.map((layout, index) => {
        const profile = profiles[index]
        if (!profile) return null

        return (
          <motion.div
            key={profile.name}
            className={cn("ttm-dating-float", layout.className, !reduce && "ttm-dating-float--animate")}
            initial={reduce ? false : { opacity: 0, x: index === 0 ? -40 : index === 2 ? 40 : 0, y: 32 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.85, delay: layout.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-dating-float__photo">
              <Image
                src={profile.imageUrl}
                alt=""
                fill
                className="object-cover object-[center_20%]"
                sizes="160px"
                draggable={false}
                priority={index === 1}
              />
              <div className="ttm-dating-float__shade" />
              <span className="ttm-dating-float__score">{profile.connectionScore}%</span>
            </div>
            <div className="ttm-dating-float__meta">
              <span className="ttm-dating-float__name">
                {profile.name}, {profile.age}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
