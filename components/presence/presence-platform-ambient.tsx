"use client"

import { useMemo } from "react"
import { useReducedMotion } from "motion/react"
import { resolveLateNightPresence } from "@/lib/presence"
import { usePresenceRealtime } from "@/hooks/use-presence-realtime"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type PresencePlatformAmbientProps = {
  className?: string
}

/** Subtle platform whisper — late-night intimacy, no tracking spam. */
export function PresencePlatformAmbient({ className }: PresencePlatformAmbientProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const tick = usePresenceRealtime({ intervalMs: 60_000, activeIntervalMs: 60_000 })

  const late = useMemo(() => {
    void tick
    return resolveLateNightPresence(new Date().getHours())
  }, [tick])

  if (reduce || !late.active) return null

  return (
    <p
      className={cn(
        "p18-platform-whisper text-[10px] font-extralight tracking-[0.12em] text-indigo-200/55",
        className
      )}
      role="status"
    >
      {t(late.labelKey)}
    </p>
  )
}
