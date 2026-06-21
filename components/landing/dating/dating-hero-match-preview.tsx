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
import type { DatingDemoProfile } from "@/components/landing/dating/use-dating-profiles"
import { useMouseTilt } from "@/hooks/use-mouse-tilt"
import { useScrollParallaxY } from "@/hooks/use-parallax"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type DatingHeroMatchPreviewProps = {
  scrollProgress: MotionValue<number>
}

function ProfileCard({
  profile,
  variant,
  reduce,
  scrollProgress,
}: {
  profile: DatingDemoProfile
  variant: "back" | "front"
  reduce: boolean | null
  scrollProgress: MotionValue<number>
}) {
  const driftX = useTransform(
    scrollProgress,
    [0, 0.55],
    [0, reduce ? 0 : variant === "back" ? -24 : 18]
  )
  const driftY = useTransform(scrollProgress, [0, 0.55], [0, reduce ? 0 : 22])
  const scale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.93])
  const isBack = variant === "back"
  const backRotate = -17
  const frontRotate = 15

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
              x: isBack ? -88 : 88,
              y: isBack ? 20 : 28,
              rotate: isBack ? backRotate - 6 : frontRotate + 6,
              scale: 0.88,
            }
      }
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: isBack ? backRotate : frontRotate,
        scale: 1,
      }}
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
          <div className="ttm-dating-hero__portrait-glass-edge" aria-hidden />
          <div className="ttm-dating-hero__portrait-shade" />
          <div className="ttm-dating-hero__portrait-badges">
            <span className="ttm-dating-hero__portrait-score">
              {profile.connectionScore}%
            </span>
            <span className="ttm-dating-hero__portrait-online" aria-hidden />
          </div>
          <div className="ttm-dating-hero__portrait-info">
            <span className="ttm-dating-hero__portrait-name">
              {profile.name}, {profile.age}
            </span>
            <span className="ttm-dating-hero__portrait-distance">{profile.distance}</span>
          </div>
        </div>
      </div>
    </motion.figure>
  )
}

function PeekCard({
  profile,
  reduce,
}: {
  profile: DatingDemoProfile
  reduce: boolean | null
}) {
  return (
    <motion.figure
      className="ttm-dating-hero__portrait-peek"
      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <div className="ttm-dating-hero__portrait-peek-frame">
        <Image
          src={profile.imageUrl}
          alt=""
          fill
          className="object-cover object-[center_20%]"
          sizes="200px"
          draggable={false}
        />
        <div className="ttm-dating-hero__portrait-shade" />
      </div>
    </motion.figure>
  )
}

export function DatingHeroMatchPreview({ scrollProgress }: DatingHeroMatchPreviewProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const left = profiles[0]
  const right = profiles[1]
  const peek = profiles[2]
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const { ref: tiltRef, rotateX, rotateY } = useMouseTilt(tiltEnabled, 5)

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
        <div className="ttm-dating-hero__portraits-cards">
          <div className="ttm-dating-hero__portraits-glow ttm-dating-hero__portraits-glow--pulse" aria-hidden />
          <div className="ttm-dating-hero__portraits-reflection" aria-hidden />

          {peek ? <PeekCard profile={peek} reduce={reduce} /> : null}

          <ProfileCard
            profile={left}
            variant="back"
            reduce={reduce}
            scrollProgress={scrollProgress}
          />
          <ProfileCard
            profile={right}
            variant="front"
            reduce={reduce}
            scrollProgress={scrollProgress}
          />
        </div>

        <DatingHeroSpark />

        <div className="ttm-dating-hero__match-below">
          {!reduce ? (
            <motion.span
              className="ttm-dating-hero__match-label"
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("datingHeroMatchMoment")}
            </motion.span>
          ) : null}

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
            <span className="ttm-dating-hero__portraits-spark-ring ttm-dating-hero__portraits-spark-ring--outer" />
            <Heart size={28} fill="currentColor" strokeWidth={0} />
          </motion.div>
        </div>
      </motion.div>
    </DatingParallaxLayer>
  )
}
