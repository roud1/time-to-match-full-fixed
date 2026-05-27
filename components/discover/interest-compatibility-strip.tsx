"use client"

import { computeInterestOverlapForProfile } from "@/lib/discover/interest-overlap"
import { getCompatibilityTier } from "@/lib/discover/compatibility-tier"
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
  const tags = commonInterests.slice(0, 3)

  if (tags.length === 0) return null

  const tier = getCompatibilityTier(compatibility)
  const showPct = compatibility > 0

  return (
    <div className={cn("ttm-interest-compat", compact && "ttm-interest-compat--compact", className)}>
      {showPct && (
        <p
          className={cn(
            "ttm-interest-compat__pct",
            tier === "high" && "ttm-interest-compat__pct--high",
            tier === "mid" && "ttm-interest-compat__pct--mid",
            tier === "low" && "ttm-interest-compat__pct--low"
          )}
        >
          {t("discoverCompatibilityLabel")} {compatibility}%
        </p>
      )}
      <div className="ttm-interest-compat__tags">
        {tags.map((tag) => (
          <span key={`${tag.id}-${tag.name}`} className="ttm-interest-compat__chip">
            {tag.emoji ? `${tag.emoji} ` : ""}
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  )
}
