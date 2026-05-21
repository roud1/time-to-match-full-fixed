"use client"

import type { DeepConnectionStateProfile } from "@/lib/intelligence"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function DeepConnectionStateRibbon({
  profile,
  className,
}: {
  profile: DeepConnectionStateProfile
  className?: string
}) {
  const { t } = useI18n()

  return (
    <div
      className={cn("p14-deep-state", className)}
      data-deep-state={profile.state}
      style={{ ["--intel-depth" as string]: String(profile.depthLevel) }}
    >
      <p className="p14-deep-state__label">{t(profile.labelKey)}</p>
      <p className="p14-deep-state__desc">{t(profile.descriptionKey)}</p>
    </div>
  )
}
