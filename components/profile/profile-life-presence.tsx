"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n, type TranslationKey } from "@/lib/i18n"
import type { ProfileLifeView } from "@/lib/profile-life"
import { cn } from "@/lib/utils"

function statusLabel(state: ProfileLifeView["state"], t: (k: TranslationKey) => string): string {
  switch (state) {
    case "active":
      return t("lifeStatusActive")
    case "fading":
      return t("lifeStatusFading")
    case "sleeping":
      return t("lifeStatusSleeping")
    case "archived":
      return t("lifeStatusArchived")
  }
}

type ProfileLifePresenceProps = {
  life: ProfileLifeView
  onRevive?: () => void
  compact?: boolean
}

export function ProfileLifePresence({ life, onRevive, compact }: ProfileLifePresenceProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const showRevive = life.state === "sleeping" || life.state === "archived"

  return (
    <motion.div
      layout
      className={cn(
        "rounded-[1.35rem] border backdrop-blur-xl overflow-hidden relative",
        life.state === "active" && "border-emerald-500/20 bg-emerald-500/[0.05] ttm-life-active",
        life.state === "fading" && "border-white/10 bg-white/[0.03] ttm-life-fading",
        life.state === "sleeping" && "border-slate-500/20 bg-slate-500/[0.06] ttm-life-sleeping",
        life.state === "archived" && "border-white/8 bg-white/[0.02] ttm-life-archived",
        compact ? "p-4" : "p-5 mb-5"
      )}
      style={life.state === "fading" ? { ["--ttm-life-fade" as string]: life.fadeProgress } : undefined}
    >
      {!reduce && life.glowTier >= 2 && (
        <div className="pointer-events-none absolute inset-0 ttm-life-glow" aria-hidden />
      )}

      <div className="relative z-[1]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={cn(
                "text-[9px] uppercase tracking-[0.16em] font-medium px-2 py-0.5 rounded-full border",
                life.state === "active"
                  ? "border-emerald-400/35 text-emerald-100/90 bg-emerald-500/12"
                  : life.state === "fading"
                    ? "border-white/15 text-white/70 bg-white/[0.04]"
                    : "border-slate-400/25 text-slate-200/80 bg-slate-500/10"
              )}
            >
              {statusLabel(life.state, t)}
            </span>
            {life.state === "active" && (
              <span className="text-[9px] text-emerald-300/80 font-light">{t("lifeActiveNow")}</span>
            )}
          </div>
          <p className="text-sm font-extralight text-foreground/90 leading-snug">
            {life.state === "active"
              ? t("lifeActiveBody")
              : life.state === "fading"
                ? t("lifeFadingBody")
                : life.state === "sleeping"
                  ? t("lifeSleepingBody")
                  : t("lifeArchivedBody")}
          </p>
          {showRevive && onRevive && (
            <button
              type="button"
              onClick={onRevive}
              className="mt-3 w-full sm:w-auto rounded-2xl border border-white/15 bg-white/06 px-4 py-2.5 text-sm font-light text-white/85/95 hover:bg-white/08 transition-colors touch-manipulation"
            >
              {t("lifeReviveCta")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ProfileLifeDiscoverGate({
  life,
  onRevive,
  children,
}: {
  life: ProfileLifeView
  onRevive: () => void
  children: ReactNode
}) {
  const { t } = useI18n()

  if (life.discoverable) {
    return (
      <div
        className={cn(
          "flex flex-col h-full min-h-0",
          life.state === "fading" && "ttm-life-fading-deck opacity-[calc(1-var(--ttm-life-fade,0)*0.35)]"
        )}
        style={life.state === "fading" ? { ["--ttm-life-fade" as string]: life.fadeProgress } : undefined}
      >
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 items-center justify-center px-4 py-8 text-center">
      <p className="text-lg font-extralight text-foreground/90 max-w-xs">{t("lifeDiscoverPausedTitle")}</p>
      <p className="mt-2 text-sm font-light text-muted-foreground/85 max-w-sm leading-relaxed">
        {life.state === "sleeping" ? t("lifeDiscoverPausedSleep") : t("lifeDiscoverPausedArchive")}
      </p>
      <button
        type="button"
        onClick={onRevive}
        className="mt-6 rounded-2xl border border-white/16 bg-gradient-to-r from-white/08 to-white/10 px-6 py-3 text-sm font-light text-white/90 touch-manipulation hover:border-white/18 transition-colors"
      >
        {t("lifeReviveCta")}
      </button>
    </div>
  )
}
