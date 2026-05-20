"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ConnectionView, ConnectionCopyKeys } from "@/lib/connection-system"
import { stageLabel, streakMessage } from "@/lib/connection-system"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { ConnectionStreakBadge } from "@/components/connection/connection-streak-badge"
import { cn } from "@/lib/utils"

type ConnectionBannerProps = {
  view: ConnectionView
  copy: ConnectionCopyKeys & {
    timerTogether: string
    stableLabel: string
    fading: string
    fadingLong: string
    reconnect: string
  }
  premiumStrip?: string
}

export function ConnectionBanner({ view, copy, premiumStrip }: ConnectionBannerProps) {
  const reduce = useReducedMotion()
  const stage = stageLabel(view.stage, copy)
  const streak = streakMessage(view, copy)
  const statusLine = view.isFading ? (view.fadeIntensity > 0.5 ? copy.fadingLong : copy.fading) : streak

  return (
    <motion.div
      layout
      className={cn(
        "shrink-0 px-4 py-2.5 border-b relative overflow-hidden",
        view.isFading
          ? "border-amber-500/25 bg-gradient-to-r from-amber-500/[0.1] via-amber-950/20 to-transparent ttm-connection-fading"
          : view.isStable
            ? "border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.08] via-transparent to-violet-500/[0.06]"
            : "border-pink-500/20 bg-gradient-to-r from-pink-500/[0.08] via-transparent to-violet-500/[0.07]"
      )}
      style={view.isFading ? { ["--ttm-fade" as string]: view.fadeIntensity } : undefined}
    >
      {!reduce && view.auraTier >= 2 && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40 ttm-connection-banner-glow"
          aria-hidden
        />
      )}

      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-[9px] uppercase tracking-[0.16em] font-medium px-2 py-0.5 rounded-full border",
                view.stage === "stable"
                  ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-100/95"
                  : view.stage === "rare"
                    ? "border-violet-400/35 bg-violet-500/15 text-violet-100/95"
                    : "border-pink-400/30 bg-pink-500/12 text-pink-100/90"
              )}
            >
              {stage}
            </span>
            {view.streakDays > 0 && <ConnectionStreakBadge days={view.streakDays} />}
          </div>

          <p className="text-[10px] text-center sm:text-left text-amber-100/85 font-light leading-relaxed">
            <span className="uppercase tracking-[0.12em] text-white/50">{copy.timerTogether}</span>{" "}
            <ConnectionTimer view={view} stableLabel={copy.stableLabel} />
            {statusLine && (
              <>
                <span className="text-white/25 mx-1.5">·</span>
                <span className={view.isFading ? "text-amber-200/90" : "text-muted-foreground/85"}>
                  {statusLine}
                </span>
              </>
            )}
          </p>

          {!view.isFading && !view.isStable && (
            <p className="text-[10px] text-muted-foreground/75 font-light">{copy.reconnect}</p>
          )}
        </div>
      </div>

      {premiumStrip && (
        <p className="relative z-[1] text-[10px] text-center text-amber-200/70 font-light mt-1.5 tracking-wide">
          {premiumStrip}
        </p>
      )}
    </motion.div>
  )
}
