"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useEffect, useState } from "react"
import { DatingHeroSpark } from "@/components/landing/dating/dating-hero-spark"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useMouseTilt } from "@/hooks/use-mouse-tilt"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type DatingHeroMatchPreviewProps = {
  scrollProgress: MotionValue<number>
}

function Portrait({
  profile,
  variant,
  reduce,
  scrollProgress,
}: {
  profile: NonNullable<ReturnType<typeof useDatingHeroProfiles>[number]>
  variant: "back" | "front"
  reduce: boolean | null
  scrollProgress: MotionValue<number>
}) {
  const driftX = useTransform(
    scrollProgress,
    [0, 0.55],
    [0, reduce ? 0 : variant === "back" ? -28 : 22]
  )
  const driftY = useTransform(scrollProgress, [0, 0.55], [0, reduce ? 0 : 28])
  const scale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.92])
  const isBack = variant === "back"

  return (
    <motion.figure
      className={cn(
        "ttm-dating-hero__portrait",
        isBack ? "ttm-dating-hero__portrait--back" : "ttm-dating-hero__portrait--front"
      )}
      style={{ x: driftX, y: driftY, scale }}
      initial={
        reduce
          ? false
          : {
              opacity: 0,
              x: isBack ? -96 : 96,
              y: isBack ? 24 : 32,
              rotate: isBack ? -18 : 16,
              scale: 0.86,
            }
      }
      animate={{ opacity: 1, x: 0, y: 0, rotate: isBack ? -9 : 7, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 0.9,
        delay: isBack ? 0.28 : 0.42,
      }}
    >
      <div
        className={cn(
          "ttm-dating-hero__portrait-inner",
          !reduce && "ttm-dating-hero__portrait--float",
          isBack ? "ttm-dating-hero__portrait-inner--back" : "ttm-dating-hero__portrait-inner--front"
        )}
      >
        <div className="ttm-dating-hero__portrait-frame">
        <Image
          src={profile.imageUrl}
          alt=""
          fill
          className="object-cover object-[center_18%]"
          sizes="(max-width: 768px) 60vw, 380px"
          draggable={false}
          priority
        />
        <div className="ttm-dating-hero__portrait-shade" />
      </div>
      <figcaption className="ttm-dating-hero__portrait-caption">
        {profile.name}, {profile.age}
      </figcaption>
      </div>
    </motion.figure>
  )
}

export function DatingHeroMatchPreview({ scrollProgress }: DatingHeroMatchPreviewProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const left = profiles[0]
  const right = profiles[1] ?? profiles[2]
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const { ref: tiltRef, rotateX, rotateY } = useMouseTilt(tiltEnabled, 6)

  const stageY = useScrollParallaxY({ input: [0, 500], output: [0, -32] })
  const stageOpacity = useTransform(scrollProgress, [0, 0.6], [1, reduce ? 1 : 0.65])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const update = () => setTiltEnabled(mq.matches && !reduce)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [reduce])

  if (!left || !right) return null

  return (
    <DatingParallaxLayer
      y={stageY}
      opacity={stageOpacity}
      className="ttm-dating-hero__portraits-wrap"
    >
      <motion.div
        ref={tiltRef}
        className="ttm-dating-hero__portraits"
        aria-label={t("datingHeroCardsAria")}
        style={
          tiltEnabled
            ? {
                rotateX,
                rotateY,
                transformPerspective: 900,
              }
            : undefined
        }
      >
        <div className="ttm-dating-hero__portraits-glow ttm-dating-hero__portraits-glow--pulse" aria-hidden />
        <div className="ttm-dating-hero__portraits-reflection" aria-hidden />

        <DatingHeroSpark />

        <Portrait
          profile={left}
          variant="back"
          reduce={reduce}
          scrollProgress={scrollProgress}
        />
        <Portrait
          profile={right}
          variant="front"
          reduce={reduce}
          scrollProgress={scrollProgress}
        />

        <motion.div
          className={cn(
            "ttm-dating-hero__portraits-spark",
            !reduce && "ttm-dating-hero__portraits-spark--live"
          )}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.82, type: "spring", stiffness: 260, damping: 16 }}
          aria-hidden
        >
          <span className="ttm-dating-hero__portraits-spark-ring" />
          <Heart size={24} fill="currentColor" />
        </motion.div>
      </motion.div>
    </DatingParallaxLayer>
  )
}
