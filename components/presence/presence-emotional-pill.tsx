"use client"

import type { EmotionalPresence } from "@/lib/world"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const KIND_CLASS: Record<EmotionalPresence["kind"], string> = {
  energy_active: "text-indigo-200/95 border-indigo-400/35 bg-indigo-500/10",
  connection_nearby: "text-violet-200/90 border-violet-400/30 bg-violet-500/10",
  emotionally_present: "text-purple-100/95 border-purple-400/35 bg-purple-500/12",
  sync_active_tonight: "text-fuchsia-100/95 border-fuchsia-400/35 bg-fuchsia-500/12",
  deep_night_energy: "text-indigo-100/90 border-indigo-300/25 bg-indigo-950/40",
  quiet_presence: "text-slate-300/75 border-slate-500/20 bg-black/35",
  distant_field: "text-slate-400/65 border-slate-600/20 bg-black/30",
}

type PresenceEmotionalPillProps = {
  presence: EmotionalPresence
  compact?: boolean
  className?: string
}

export function PresenceEmotionalPill({ presence, compact, className }: PresenceEmotionalPillProps) {
  const { t } = useI18n()

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border backdrop-blur-md font-extralight uppercase tracking-[0.1em]",
        compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px]",
        KIND_CLASS[presence.kind],
        className
      )}
      data-presence={presence.kind}
    >
      <span
        className="relative flex h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80"
        aria-hidden
      />
      {t(presence.labelKey)}
    </span>
  )
}
