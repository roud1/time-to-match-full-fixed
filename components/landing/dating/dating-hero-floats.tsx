"use client"

import Image from "next/image"
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

const FLOAT_LAYOUT = [
  { className: "ttm-dating-float--left", delay: 0.15, depth: 0.45, flyX: -80, flyY: -40 },
  { className: "ttm-dating-float--center", delay: 0.28, depth: 0.65, flyX: 0, flyY: -60 },
  { className: "ttm-dating-float--right", delay: 0.4, depth: 0.85, flyX: 80, flyY: -35 },
] as const

function FloatCard({
  layout,
  index,
  reduce,
  profile,
  scrollProgress,
}: {
  layout: (typeof FLOAT_LAYOUT)[number]
  index: number
  reduce: boolean | null
  profile: NonNullable<ReturnType<typeof useDatingHeroProfiles>[number]>
  scrollProgress: MotionValue<number>
}) {
  const scrollY = useScrollParallaxY({
    input: [0, 600],
    output: [0, 30 + layout.depth * 45],
  })

  const scatterX = useTransform(
    scrollProgress,
    [0, 0.5],
    [0, reduce ? 0 : layout.flyX]
  )
  const scatterY = useTransform(
    scrollProgress,
    [0, 0.5],
    [0, reduce ? 0 : layout.flyY]
  )
  const scatterOpacity = useTransform(scrollProgress, [0, 0.45], [1, reduce ? 1 : 0.15])
  const scatterScale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.82])

  return (
    <DatingParallaxLayer
      y={scrollY}
      className={cn("ttm-dating-float", layout.className, !reduce && "ttm-dating-float--animate")}
    >
      <motion.div
        style={{ x: scatterX, y: scatterY, opacity: scatterOpacity, scale: scatterScale }}
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
    </DatingParallaxLayer>
  )
}

type DatingHeroFloatsProps = {
  scrollProgress: MotionValue<number>
}

export function DatingHeroFloats({ scrollProgress }: DatingHeroFloatsProps) {
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()

  return (
    <div className="ttm-dating-hero__floats" aria-hidden>
      {FLOAT_LAYOUT.map((layout, index) => {
        const profile = profiles[index]
        if (!profile) return null

        return (
          <FloatCard
            key={profile.name}
            layout={layout}
            index={index}
            reduce={reduce}
            profile={profile}
            scrollProgress={scrollProgress}
          />
        )
      })}
    </div>
  )
}
