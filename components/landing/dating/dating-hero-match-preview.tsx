"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
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
    [0, reduce ? 0 : variant === "back" ? -18 : 14]
  )
  const driftY = useTransform(scrollProgress, [0, 0.55], [0, reduce ? 0 : 22])
  const scale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.94])

  return (
    <motion.figure
      className={cn(
        "ttm-dating-hero__portrait",
        variant === "back" ? "ttm-dating-hero__portrait--back" : "ttm-dating-hero__portrait--front"
      )}
      style={{ x: driftX, y: driftY, scale }}
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.9,
        delay: variant === "back" ? 0.2 : 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="ttm-dating-hero__portrait-frame">
        <Image
          src={profile.imageUrl}
          alt=""
          fill
          className="object-cover object-[center_18%]"
          sizes="(max-width: 768px) 55vw, 280px"
          draggable={false}
          priority
        />
        <div className="ttm-dating-hero__portrait-shade" />
      </div>
      <figcaption className="ttm-dating-hero__portrait-caption">
        {profile.name}, {profile.age}
      </figcaption>
    </motion.figure>
  )
}

export function DatingHeroMatchPreview({ scrollProgress }: DatingHeroMatchPreviewProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const left = profiles[0]
  const right = profiles[1] ?? profiles[2]

  const stageY = useScrollParallaxY({ input: [0, 500], output: [0, -28] })
  const stageOpacity = useTransform(scrollProgress, [0, 0.6], [1, reduce ? 1 : 0.7])

  if (!left || !right) return null

  return (
    <DatingParallaxLayer
      y={stageY}
      opacity={stageOpacity}
      className="ttm-dating-hero__portraits-wrap"
    >
      <motion.div
        className="ttm-dating-hero__portraits"
        aria-label={t("datingHeroCardsAria")}
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ttm-dating-hero__portraits-glow" aria-hidden />

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
          transition={{ duration: 0.55, delay: 0.75, type: "spring", stiffness: 260, damping: 18 }}
          aria-hidden
        >
          <span className="ttm-dating-hero__portraits-spark-ring" />
          <Heart size={20} fill="currentColor" />
        </motion.div>
      </motion.div>
    </DatingParallaxLayer>
  )
}
