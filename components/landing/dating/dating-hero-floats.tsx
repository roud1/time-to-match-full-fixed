"use client"

import Image from "next/image"
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

const FLOAT_LAYOUT = {
  className: "ttm-dating-float--accent",
  delay: 0.28,
  depth: 0.55,
  flyX: 36,
  flyY: -18,
} as const

function FloatCard({
  reduce,
  profile,
  scrollProgress,
}: {
  reduce: boolean | null
  profile: NonNullable<ReturnType<typeof useDatingHeroProfiles>[number]>
  scrollProgress: MotionValue<number>
}) {
  const scrollY = useScrollParallaxY({
    input: [0, 600],
    output: [0, 24 + FLOAT_LAYOUT.depth * 35],
  })

  const scatterX = useTransform(
    scrollProgress,
    [0, 0.5],
    [0, reduce ? 0 : FLOAT_LAYOUT.flyX]
  )
  const scatterY = useTransform(
    scrollProgress,
    [0, 0.5],
    [0, reduce ? 0 : FLOAT_LAYOUT.flyY]
  )
  const scatterOpacity = useTransform(scrollProgress, [0, 0.45], [1, reduce ? 1 : 0.18])
  const scatterScale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.88])

  return (
    <DatingParallaxLayer
      y={scrollY}
      className={cn("ttm-dating-float", FLOAT_LAYOUT.className, !reduce && "ttm-dating-float--animate")}
    >
      <motion.figure
        className="ttm-dating-float__card"
        style={{ x: scatterX, y: scatterY, opacity: scatterOpacity, scale: scatterScale }}
        initial={reduce ? false : { opacity: 0, x: 28, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.85, delay: FLOAT_LAYOUT.delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ttm-dating-float__photo">
          <Image
            src={profile.imageUrl}
            alt=""
            fill
            className="object-cover object-[center_20%]"
            sizes="140px"
            draggable={false}
          />
          <div className="ttm-dating-float__shade" />
        </div>
        <figcaption className="ttm-dating-float__caption">
          {profile.name}, {profile.age}
        </figcaption>
      </motion.figure>
    </DatingParallaxLayer>
  )
}

type DatingHeroFloatsProps = {
  scrollProgress: MotionValue<number>
}

export function DatingHeroFloats({ scrollProgress }: DatingHeroFloatsProps) {
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const profile = profiles[3] ?? profiles[2]

  if (!profile) return null

  return (
    <div className="ttm-dating-hero__floats ttm-dating-hero__floats--accent" aria-hidden>
      <FloatCard reduce={reduce} profile={profile} scrollProgress={scrollProgress} />
    </div>
  )
}
