"use client"

import { useReducedMotion } from "motion/react"
import type { EmotionalPresence } from "@/client/lib/world"
import type { ConnectionResonance } from "@/client/lib/presence"
import { cn } from "@/client/lib/utils"

type PresenceAvatarAuraProps = {
  presence: EmotionalPresence
  resonance?: ConnectionResonance
  shared?: boolean
  className?: string
}

export function PresenceAvatarAura({
  presence,
  resonance,
  shared,
  className,
}: PresenceAvatarAuraProps) {
  const reduce = useReducedMotion()

  return (
    <span
      className={cn(
        "p18-avatar-aura",
        shared && "p18-avatar-aura--shared",
        !reduce && "p18-avatar-aura--breathe",
        className
      )}
      aria-hidden
      data-presence={presence.kind}
      style={{
        ["--presence-pulse" as string]: String(presence.pulseLevel),
        ["--presence-hue" as string]: String(presence.glowHue),
        ["--pres-resonance" as string]: String(resonance?.level ?? presence.pulseLevel),
      }}
    />
  )
}
