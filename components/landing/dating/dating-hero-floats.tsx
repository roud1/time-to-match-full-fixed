"use client"

import Image from "next/image"
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

const FLOAT_LAYOUT = [
  { className: "ttm-dating-float--accent-left", delay: 0.2, depth: 0.5, flyX: -60, flyY: -30 },
  { className: "ttm-dating-float--accent-right", delay: 0.35, depth: 0.7, flyX: 60, flyY: -25 },
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
    output: [0, 24 + layout.depth * 35],
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
  const scatterOpacity = useTransform(scrollProgress, [0, 0.45], [1, reduce ? 1 : 0.12])
  const scatterScale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.85])

  return (
    <DatingParallaxLayer
      y={scrollY}
      className={cn("ttm-dating-float", layout.className, !reduce && "ttm-dating-float--animate")}
    >
      <motion.div
        style={{ x: scatterX, y: scatterY, opacity: scatterOpacity, scale: scatterScale }}
        initial={reduce ? false : { opacity: 0, x: index === 0 ? -32 : 32, y: 24 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.85, delay: layout.delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ttm-dating-float__photo">
          <Image
            src={profile.imageUrl}
            alt=""
            fill
            className="object-cover object-[center_20%]"
            sizes="120px"
            draggable={false}
          />
          <div className="ttm-dating-float__shade" />
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
    <div className="ttm-dating-hero__floats ttm-dating-hero__floats--accent" aria-hidden>
      {FLOAT_LAYOUT.map((layout, index) => {
        const profile = profiles[index + 2] ?? profiles[index]
        if (!profile) return null

        return (
          <FloatCard
            key={`${profile.name}-${index}`}
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
