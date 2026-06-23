"use client"

import { useMemo } from "react"
import { usePresenceRealtime } from "@/client/hooks/use-presence-realtime"
import { useEmotionalWorld } from "@/client/hooks/use-emotional-world"
import { analyzeEmotionalOperatingSystem } from "@/client/lib/emotional-os"
import { analyzeEmotionalRealityExpansion } from "@/client/lib/reality-expansion"
import { analyzeEmotionalConsciousness } from "@/client/lib/emotional-consciousness"
import type { EmotionalConsciousness } from "@/client/lib/emotional-consciousness"
import type { EmotionalOperatingSystem } from "@/client/lib/emotional-os"
import type { EmotionalRealityExpansion } from "@/client/lib/reality-expansion"
import type { ChatMessage } from "@/client/lib/social-store"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"
import { getLastActiveAt } from "@/client/lib/profile-life-store"

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
