"use client"

import Link from "next/link"
import { Clock, Sparkles } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DatingHeroAtmosphere } from "@/components/landing/dating/dating-hero-atmosphere"
import { DatingHeroBottomBand } from "@/components/landing/dating/dating-hero-bottom-band"
import { DatingHeroMatchPreview } from "@/components/landing/dating/dating-hero-match-preview"
import { useParallaxIntensity } from "@/hooks/use-parallax"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

function useCountdownDisplay() {
  const [time, setTime] = useState("23:59:42")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(24, 0, 0, 0)
      const diff = Math.max(0, end.getTime() - now.getTime())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setTime(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      )
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return time
}

function StaggerWords({
  text,
  className,
  wordClassName,
  baseDelay = 0,
}: {
  text: string
  className?: string
  wordClassName?: string
  baseDelay?: number
}) {
  const reduce = useReducedMotion()
  const words = text.split(/\s+/).filter(Boolean)

  if (reduce) {
    return <span className={cn(className, wordClassName)}>{text}</span>
  }

  return (
    <span className={className} aria-hidden>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className={cn("ttm-dating-hero__title-word", wordClassName)}
          initial={{ opacity: 0, y: 32, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.72,
            delay: baseDelay + index * 0.09,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  )
}

function CountdownValue({ value }: { value: string }) {
  const reduce = useReducedMotion()
  const segments = value.split(":")

  return (
    <span
      className={cn(
        "ttm-dating-hero__countdown-value",
        !reduce && "ttm-dating-hero__countdown-value--live"
      )}
      aria-live="polite"
    >
      {segments.map((segment, index) => (
        <span key={index} className="ttm-dating-hero__countdown-segment-wrap">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={segment}
              className="ttm-dating-hero__countdown-segment"
              initial={reduce ? false : { opacity: 0, y: 10, rotateX: -72 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8, rotateX: 72 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              {segment}
            </motion.span>
          </AnimatePresence>
          {index < segments.length - 1 ? (
            <span className="ttm-dating-hero__countdown-colon">:</span>
          ) : null}
        </span>
      ))}
    </span>
  )
}

const STAGGER = {
  eyebrow: 0,
  timer: 0.08,
  title1: 0.14,
  title2: 0.34,
  title3: 0.52,
  sub: 0.62,
  actions: 0.72,
  chips: 0.82,
  visual: 0.2,
} as const

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const intensity = useParallaxIntensity(1)
  const sectionRef = useRef<HTMLElement>(null)
  const [ctaHref, setCtaHref] = useState("/register")
  const countdown = useCountdownDisplay()

  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const contentY = useTransform(scrollY, [0, 480], [0, reduce ? 0 : -56 * intensity])
  const contentScale = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0.94])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, reduce ? 1 : 0.42])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -24 * intensity])
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  const heroChips = useMemo(() => [t("datingHeroChip1"), t("datingHeroChip2")], [t])
  const titleFull = `${t("datingHeroTitleLine1")} ${t("datingHeroTitleLine2")} ${t("datingHeroTitleLine3")}`

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section
      ref={sectionRef}
      className="ttm-dating-hero ttm-dating-hero--cinematic"
      aria-labelledby="dating-hero-title"
    >
      <DatingHeroAtmosphere scrollProgress={scrollYProgress} />

      <motion.div
        className="ttm-dating-hero__content"
        style={{ y: contentY, scale: contentScale, opacity: contentOpacity }}
      >
        <div className="ttm-dating-container ttm-dating-hero__main">
          <div className="ttm-dating-hero__stack">
            <motion.div className="ttm-dating-hero__copy" style={{ y: copyY }}>
              <motion.p className="ttm-dating-hero__eyebrow" {...fadeUp(STAGGER.eyebrow)}>
                <Sparkles size={14} aria-hidden />
                {t("datingHeroEyebrow")}
              </motion.p>

              <motion.div
                className={cn(
                  "ttm-dating-hero__countdown-pill",
                  !reduce && "ttm-dating-hero__countdown-pill--pulse"
                )}
                {...fadeUp(STAGGER.timer)}
              >
                <Clock size={14} aria-hidden />
                <span className="ttm-dating-hero__countdown-label">{t("datingHow3Title")}</span>
                <CountdownValue value={countdown} />
              </motion.div>

              <motion.h1
                id="dating-hero-title"
                className="ttm-dating-hero__title"
                aria-label={titleFull}
              >
                <span className="ttm-dating-hero__title-line">
                  <StaggerWords text={t("datingHeroTitleLine1")} baseDelay={STAGGER.title1} />
                </span>
                <span className="ttm-dating-hero__title-line ttm-dating-hero__title-line--hook">
                  <StaggerWords
                    text={t("datingHeroTitleLine2")}
                    wordClassName="ttm-dating-hero__title-word--hook"
                    baseDelay={STAGGER.title2}
                  />
                </span>
                <span className="ttm-dating-hero__title-line ttm-dating-hero__title-line--punch">
                  <StaggerWords
                    text={t("datingHeroTitleLine3")}
                    wordClassName="ttm-dating-hero__title-word--punch"
                    baseDelay={STAGGER.title3}
                  />
                </span>
              </motion.h1>

              <motion.p className="ttm-dating-hero__sub" {...fadeUp(STAGGER.sub)}>
                {t("datingHeroSub")}
              </motion.p>

              <motion.div className="ttm-dating-hero__actions" {...fadeUp(STAGGER.actions)}>
                <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero ttm-dating-cta--pulse">
                  <span className="ttm-dating-cta__ring" aria-hidden />
                  <span className="ttm-dating-cta__shine" aria-hidden />
                  {t("datingHeroCta")}
                </Link>
                <Link href="/login" className="ttm-dating-cta ttm-dating-cta--ghost">
                  {t("login")}
                </Link>
              </motion.div>

              <motion.ul
                className="ttm-dating-hero__chips"
                aria-label={t("datingHeroChipsAria")}
                {...fadeUp(STAGGER.chips)}
              >
                {heroChips.map((chip) => (
                  <li key={chip} className="ttm-dating-hero__chip">
                    {chip}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              className="ttm-dating-hero__visual"
              initial={reduce ? false : { opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: STAGGER.visual, ease: [0.22, 1, 0.36, 1] }}
            >
              <DatingHeroMatchPreview scrollProgress={scrollYProgress} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <DatingHeroBottomBand scrollHintOpacity={scrollHintOpacity} />
    </section>
  )
}
