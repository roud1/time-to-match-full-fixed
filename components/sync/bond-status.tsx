"use client"

import type { ConnectionView } from "@/lib/connection-system"
import type { SyncMetrics } from "@/lib/sync-system"
import { syncStatusKey } from "@/lib/sync-system"
import type { TranslationKey } from "@/lib/i18n"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type BondStatusProps = {
  view: ConnectionView
  metrics: SyncMetrics | null
  className?: string
  size?: "sm" | "md"
}

export function BondStatus({ view, metrics, className, size = "md" }: BondStatusProps) {
  const { t } = useI18n()
  if (!metrics) return null
  const key = syncStatusKey(metrics, view) as TranslationKey

  return (
    <p
      className={cn(
        "font-extralight leading-snug",
        size === "sm" ? "text-[10px]" : "text-xs",
        metrics.isSynced ? "text-white/75" : metrics.isFading ? "text-amber-200/70" : "text-white/50",
        className
      )}
    >
      {t(key)}
    </p>
  )
}
