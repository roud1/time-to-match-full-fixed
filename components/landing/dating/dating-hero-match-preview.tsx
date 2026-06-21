"use client"

import Image from "next/image"
import { Heart, Sparkles } from "lucide-react"
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
  countdown: string
  scrollProgress: MotionValue<number>
}

function MatchProfileCard({
  profile,
  side,
  reduce,
  scrollProgress,
}: {
  profile: NonNullable<ReturnType<typeof useDatingHeroProfiles>[number]>
  side: "left" | "right"
  reduce: boolean | null
  scrollProgress: MotionValue<number>
}) {
  const flyX = useTransform(
    scrollProgress,
    [0, 0.6],
    [0, reduce ? 0 : side === "left" ? -48 : 48]
  )
  const flyY = useTransform(scrollProgress, [0, 0.6], [0, reduce ? 0 : 28])
  const cardScale = useTransform(scrollProgress, [0, 0.5], [1, reduce ? 1 : 0.88])

  return (
    <motion.div
      className={cn(
        "ttm-dating-hero__match-profile",
        side === "left" ? "ttm-dating-hero__match-profile--left" : "ttm-dating-hero__match-profile--right"
      )}
      style={{ x: flyX, y: flyY, scale: cardScale }}
      initial={reduce ? false : { opacity: 0, x: side === "left" ? -32 : 32, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.85, delay: side === "left" ? 0.25 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ttm-dating-hero__match-photo">
        <Image
          src={profile.imageUrl}
          alt=""
          fill
          className="object-cover object-[center_20%]"
          sizes="140px"
          draggable={false}
          priority
        />
        <div className="ttm-dating-hero__match-shade" />
        <span className="ttm-dating-hero__match-score">{profile.connectionScore}%</span>
      </div>
      <p className="ttm-dating-hero__match-name">
        {profile.name}, {profile.age}
      </p>
    </motion.div>
  )
}

export function DatingHeroMatchPreview({ countdown, scrollProgress }: DatingHeroMatchPreviewProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const left = profiles[0]
  const right = profiles[1] ?? profiles[2]

  const stageY = useScrollParallaxY({ input: [0, 500], output: [0, -35] })
  const stageScale = useTransform(scrollProgress, [0, 0.55], [1, reduce ? 1 : 0.94])
  const stageOpacity = useTransform(scrollProgress, [0, 0.65], [1, reduce ? 1 : 0.75])

  if (!left || !right) return null

  const matchScore = Math.round((left.connectionScore + right.connectionScore) / 2)

  return (
    <DatingParallaxLayer
      y={stageY}
      opacity={stageOpacity}
      className="ttm-dating-hero__match-stage-wrap"
    >
      <motion.div
        className="ttm-dating-hero__match-stage"
        style={{ scale: stageScale }}
        initial={reduce ? false : { opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        aria-label={t("datingHeroCardsAria")}
      >
        <div className="ttm-dating-hero__match-aurora" aria-hidden />

        <div className="ttm-dating-hero__match-timer">
          <span className="ttm-dating-hero__match-timer-label">{t("datingHow3Title")}</span>
          <span className="ttm-dating-hero__match-timer-value" aria-live="polite">
            {countdown}
          </span>
          <p className="ttm-dating-hero__match-timer-caption">{t("datingHeroTime")}</p>
        </div>

        <div className="ttm-dating-hero__match-arena">
          <MatchProfileCard
            profile={left}
            side="left"
            reduce={reduce}
            scrollProgress={scrollProgress}
          />

          <div className="ttm-dating-hero__match-bridge" aria-hidden>
            <svg
              className="ttm-dating-hero__match-line"
              viewBox="0 0 120 40"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="dt-match-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--dt-rose-soft)" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="var(--dt-coral)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--dt-amber)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 0 20 Q 60 4 120 20"
                fill="none"
                stroke="url(#dt-match-line-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                className={cn(!reduce && "ttm-dating-hero__match-line-path")}
              />
            </svg>

            <motion.span
              className={cn(
                "ttm-dating-hero__match-spark",
                !reduce && "ttm-dating-hero__match-spark--live"
              )}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sparkles size={14} aria-hidden />
            </motion.span>

            <motion.span
              className={cn(
                "ttm-dating-hero__match-heart",
                !reduce && "ttm-dating-hero__match-heart--pulse"
              )}
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.55, delay: 0.85, type: "spring", stiffness: 260, damping: 18 }}
            >
              <Heart size={22} fill="currentColor" aria-hidden />
            </motion.span>
          </div>

          <MatchProfileCard
            profile={right}
            side="right"
            reduce={reduce}
            scrollProgress={scrollProgress}
          />
        </div>

        <div className="ttm-dating-hero__match-result">
          <span className="ttm-dating-hero__match-result-score">{matchScore}%</span>
          <span className="ttm-dating-hero__match-result-label">{t("datingAiOutputLabel")}</span>
        </div>
      </motion.div>
    </DatingParallaxLayer>
  )
}
