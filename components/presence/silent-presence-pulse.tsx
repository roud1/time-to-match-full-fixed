"use client"

import type { SilentPresenceSignal } from "@/lib/presence"
import { useI18n } from "@/lib/i18n"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type SilentPresencePulseProps = {
  silent: SilentPresenceSignal
  className?: string
}

export function SilentPresencePulse({ silent, className }: SilentPresencePulseProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (!silent.active || silent.kind === "none") return null

  return (
    <div
      className={cn("p18-silent-pulse", className)}
      data-silent={silent.kind}
      role="status"
      style={{ ["--pres-silent-pulse" as string]: String(silent.pulse) }}
    >
      {!reduce && <span className="p18-silent-pulse__ring" aria-hidden />}
      {silent.hintKey && (
        <p className="p18-silent-pulse__hint">{t(silent.hintKey)}</p>
      )}
    </div>
  )
}
