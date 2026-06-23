"use client"

import type { EmotionalOrchestration } from "@/client/lib/emotional-os"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type EmotionalOsWhisperProps = {
  orchestration: EmotionalOrchestration
  className?: string
}

export function EmotionalOsWhisper({ orchestration, className }: EmotionalOsWhisperProps) {
  const { t } = useI18n()
  if (!orchestration.whisperKey) return null

  return (
    <p
      className={cn(
        "eo-whisper text-[10px] font-extralight tracking-[0.14em] text-indigo-200/50 uppercase",
        className
      )}
      role="status"
    >
      {t(orchestration.whisperKey)}
    </p>
  )
}
