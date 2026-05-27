"use client"

import { computeInterestOverlapForProfile } from "@/lib/discover/interest-overlap"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type InterestCompatibilityStripProps = {
  profile: SwipeProfile
  compact?: boolean
  className?: string
}

export function InterestCompatibilityStrip({
  profile,
  compact,
  className,
}: InterestCompatibilityStripProps) {
  const { t } = useI18n()
  const { compatibility, commonInterests } = computeInterestOverlapForProfile(profile)
  const high = compatibility > 70
  const tags = commonInterests.slice(0, compact ? 2 : 3)

  if (compatibility <= 0 && tags.length === 0) return null

  return (
    <div className={cn("space-y-1", className)}>
      {compatibility > 0 && (
        <p
          className={cn(
            "text-[10px] font-light tabular-nums",
            high ? "text-emerald-300" : "text-white/75"
          )}
        >
          {t("discoverCompatibilityLabel")} {compatibility}%
        </p>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={`${tag.id}-${tag.name}`}
              className="px-2 py-0.5 rounded-full text-[9px] font-light border border-white/12 bg-black/35 text-white/80 backdrop-blur-sm"
            >
              {tag.emoji ? `${tag.emoji} ` : ""}
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
