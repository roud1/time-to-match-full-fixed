"use client"

import type { PeerTrustSignals } from "@/client/lib/demo-trust-signals"
import { cn } from "@/client/lib/utils"

export function PeerTrustChip({
  signals,
  labels,
  className,
}: {
  signals: PeerTrustSignals
  labels: {
    trustShort: string
    verified: string
    review: string
  }
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-[10px] font-light tracking-wide",
        className
      )}
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-white/85 backdrop-blur-md"
        aria-label={`${labels.trustShort} ${signals.score}`}
      >
        <span className="tabular-nums text-white/80/95">{signals.score}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/70">{labels.trustShort}</span>
      </span>
      {signals.photoVerified && (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-100/95 backdrop-blur-md">
          <svg className="w-3 h-3 text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          {labels.verified}
        </span>
      )}
      {signals.reviewSurface && (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-100/90 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 ttm-presence-glow-amber" aria-hidden />
          {labels.review}
        </span>
      )}
    </div>
  )
}
