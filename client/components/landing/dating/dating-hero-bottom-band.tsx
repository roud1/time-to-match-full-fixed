"use client"

import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { useDatingHeroProfiles } from "@/client/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type DatingHeroBottomBandProps = {
  scrollHintOpacity: MotionValue<number>
}

export function DatingHeroBottomBand({ scrollHintOpacity }: DatingHeroBottomBandProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const profiles = useDatingHeroProfiles()
  const [tickerIndex, setTickerIndex] = useState(0)

  const tickerNames = useMemo(
    () => profiles.map((p) => p.name).filter(Boolean),
    [profiles]
  )

  useEffect(() => {
    if (reduce || tickerNames.length < 2) return
    const id = window.setInterval(() => {
      setTickerIndex((i) => (i + 1) % tickerNames.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [reduce, tickerNames.length])

  const activeName = tickerNames[tickerIndex] ?? tickerNames[0] ?? "Emma"

  return (
    <div className="ttm-dating-hero__bottom-band">
      <motion.div
        className="ttm-dating-hero__scroll-hint"
        style={{ opacity: scrollHintOpacity }}
        aria-hidden
      >
        <span className="ttm-dating-hero__scroll-label">{t("datingHeroScrollHint")}</span>
        <ChevronDown
          size={18}
          className={cn(
            "ttm-dating-hero__scroll-chevron",
            !reduce && "ttm-dating-hero__scroll-chevron--live"
          )}
        />
      </motion.div>

      <div className="ttm-dating-hero__social-strip" aria-live="polite">
        <span className="ttm-dating-hero__social-live">
          <span className="ttm-dating-hero__social-dot" aria-hidden />
          {t("datingHeroMatchesToday").replace("{count}", "2,847")}
        </span>
        <span className="ttm-dating-hero__social-divider" aria-hidden />
        <span className="ttm-dating-hero__social-ticker">
          {t("datingHeroLiveTicker").replace("{name}", activeName)}
        </span>
      </div>
    </div>
  )
}
