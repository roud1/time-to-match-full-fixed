"use client"

import Image from "next/image"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { useEffect, useState, type CSSProperties } from "react"
import { useI18n } from "@/client/lib/i18n"
import { SyncRing } from "@/client/components/sync/sync-ring"
import type { SyncMetrics } from "@/client/lib/sync-system"
import { cn } from "@/client/lib/utils"

const AVATAR_A = "/images/profile-1.jpg"
const AVATAR_B = "/images/profile-2.jpg"

function DemoAvatar({
  src,
  alt,
  accent,
  className,
}: {
  src: string
  alt: string
  accent: "warm" | "cool"
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const fallback =
    accent === "warm"
      ? "linear-gradient(145deg, rgba(200,170,140,0.55) 0%, rgba(120,90,70,0.35) 100%)"
      : "linear-gradient(145deg, rgba(130,160,210,0.65) 0%, rgba(70,90,140,0.4) 100%)"

  return (
    <div
      className={cn(
        "live-connection-demo__avatar relative h-[4.5rem] w-[4.5rem] sm:h-[5rem] sm:w-[5rem]",
        `live-connection-demo__avatar--${accent}`,
        className
      )}
    >
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-[center_20%]"
          sizes="80px"
          priority
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-end justify-center pb-2"
          style={{ background: fallback }}
          aria-hidden
        >
          <span className="block w-[42%] aspect-square rounded-full bg-white/25 mb-[18%]" />
        </div>
      )}
    </div>
  )
}

const INSIGHT_KEYS = [
  "chatInsightTonight",
  "chatInsightSyncGrowing",
  "chatInsightChemistryStronger",
] as const

function buildDemoMetrics(syncPercent: number): SyncMetrics {
  const tier =
    syncPercent >= 90 ? "synced" : syncPercent >= 70 ? "vibrant" : syncPercent >= 45 ? "active" : "soft"
  return {
    syncPercent,
    connectionPercent: syncPercent,
    chemistryPercent: Math.min(100, syncPercent + 8),
    energyPercent: Math.min(100, syncPercent - 4),
    bondPercent: Math.min(100, Math.round(syncPercent * 0.92)),
    tier,
    isActive: true,
    isFading: false,
    isSynced: syncPercent >= 90,
    recentActivity: true,
    aiEnhanced: true,
  }
}

export function LiveConnectionVisual({ className }: { className?: string }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [syncPercent, setSyncPercent] = useState(85)
  const [insightIndex, setInsightIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const syncId = setInterval(() => {
      setSyncPercent((p) => {
        const next = p + (Math.random() > 0.4 ? 1 : -1)
        return Math.min(88, Math.max(80, next))
      })
    }, 3200)
    return () => clearInterval(syncId)
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const insightId = setInterval(() => {
      setInsightIndex((i) => (i + 1) % INSIGHT_KEYS.length)
    }, 6000)
    return () => clearInterval(insightId)
  }, [reduce])

  const metrics = buildDemoMetrics(syncPercent)
  const insightKey = INSIGHT_KEYS[insightIndex]

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("live-connection-demo w-full max-w-[360px] mx-auto p-5 sm:p-6", className)}
    >
      <span className="live-connection-demo__aura" aria-hidden />

      <p className="live-connection-demo__label relative z-[1] mb-5 text-center">
        {t("landingLiveSystemLabel")}
      </p>

      <div className="live-connection-demo__stage relative z-[1] mx-auto">
        <span className="live-connection-demo__orbit live-connection-demo__orbit--outer" aria-hidden />
        <span className="live-connection-demo__orbit live-connection-demo__orbit--inner" aria-hidden />
        <span
          className="live-connection-demo__sync-glow pointer-events-none"
          style={{ ["--sync-demo-p" as string]: syncPercent } as CSSProperties}
          aria-hidden
        />

        <motion.div
          className="live-connection-demo__avatar-slot live-connection-demo__avatar-slot--left"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <DemoAvatar src={AVATAR_A} alt="" accent="warm" />
        </motion.div>

        <div className="live-connection-demo__sync-slot">
          <SyncRing
            metrics={metrics}
            size="lg"
            aiBoost
            steady
            className="live-connection-demo__sync-ring"
          >
            <div className="live-connection-demo__sync-core flex size-full items-center justify-center rounded-full">
              <span className="live-connection-demo__sync-value text-xl sm:text-2xl font-medium tabular-nums leading-none">
                {syncPercent}
              </span>
            </div>
          </SyncRing>
        </div>

        <motion.div
          className="live-connection-demo__avatar-slot live-connection-demo__avatar-slot--right"
          animate={reduce ? undefined : { y: [0, 4, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <DemoAvatar src={AVATAR_B} alt="" accent="cool" />
        </motion.div>

        {!reduce &&
          [0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="live-connection-demo__particle pointer-events-none"
              style={{
                left: `${42 + i * 5}%`,
                top: `${38 + (i % 3) * 12}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              aria-hidden
            />
          ))}

        <p className="live-connection-demo__sync-label">
          {t("syncLabel")} {syncPercent}%
        </p>
      </div>

      <div className="relative z-[1] mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="live-connection-demo__metric-label">{t("chemistryLabel")}</span>
          <span className="live-connection-demo__metric-value">{t("landingChemistryHigh")}</span>
        </div>
        <div className="live-connection-demo__metric-bar">
          <motion.div
            className="live-connection-demo__metric-fill"
            animate={{ width: `${Math.min(100, syncPercent + 10)}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="live-connection-demo__metric-label">{t("bondLabel")}</span>
          <span className="live-connection-demo__metric-value">{t("bondStableLabel")}</span>
        </div>
        <div className="live-connection-demo__metric-bar">
          <motion.div
            className="live-connection-demo__metric-fill"
            animate={{ width: `${Math.min(100, syncPercent - 6)}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="live-connection-demo__insight relative z-[1] mt-5 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3.5 rounded-b-[1.65rem]">
        <p className="live-connection-demo__label mb-1">{t("chatInsightLabel")}</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={insightKey}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.45 }}
            className="live-connection-demo__insight-text"
          >
            {t(insightKey)}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
