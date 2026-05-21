"use client"

import { useMemo } from "react"
import { usePresenceRealtime } from "@/hooks/use-presence-realtime"
import { useEmotionalWorld } from "@/hooks/use-emotional-world"
import { analyzeEmotionalOperatingSystem } from "@/lib/emotional-os"
import { analyzeEmotionalRealityExpansion } from "@/lib/reality-expansion"
import { analyzeEmotionalConsciousness } from "@/lib/emotional-consciousness"
import type { EmotionalConsciousness } from "@/lib/emotional-consciousness"
import type { EmotionalOperatingSystem } from "@/lib/emotional-os"
import type { EmotionalRealityExpansion } from "@/lib/reality-expansion"
import type { ChatMessage } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"
import { getLastActiveAt } from "@/lib/profile-life-store"

type UseEmotionalConsciousnessOptions = {
  locale?: Locale
  position?: GeoPosition | null
  profileId?: number
  messages?: ChatMessage[]
}

export type EmotionalConsciousnessBundle = EmotionalConsciousness & {
  os: EmotionalOperatingSystem
  expansion: EmotionalRealityExpansion
}

export function useEmotionalConsciousness(
  options: UseEmotionalConsciousnessOptions = {}
): EmotionalConsciousnessBundle {
  const tick = usePresenceRealtime({ intervalMs: 30_000, activeIntervalMs: 10_000 })
  const world = useEmotionalWorld()

  return useMemo(() => {
    void tick
    void world
    const os = analyzeEmotionalOperatingSystem({
      locale: options.locale,
      position: options.position,
      profileId: options.profileId,
      messages: options.messages,
      lastActiveAt: getLastActiveAt(),
    })
    const expansion = analyzeEmotionalRealityExpansion(os, {
      locale: options.locale,
      position: options.position,
      profileId: options.profileId,
      messages: options.messages,
    })
    const consciousness = analyzeEmotionalConsciousness(os, expansion, {
      locale: options.locale,
      profileId: options.profileId,
      messages: options.messages,
    })
    return { ...consciousness, os, expansion }
  }, [
    tick,
    world.energy,
    world.pulse,
    world.connectionCount,
    options.locale,
    options.position,
    options.profileId,
    options.messages,
  ])
}
