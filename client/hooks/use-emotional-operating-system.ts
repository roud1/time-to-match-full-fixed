"use client"

import { useMemo } from "react"
import { usePresenceRealtime } from "@/client/hooks/use-presence-realtime"
import { useEmotionalWorld } from "@/client/hooks/use-emotional-world"
import { analyzeEmotionalOperatingSystem, type EmotionalOperatingSystem } from "@/client/lib/emotional-os"
import type { ChatMessage } from "@/client/lib/social-store"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"
import { getLastActiveAt, recordProfileActivity } from "@/client/lib/profile-life-store"

type UseEmotionalOperatingSystemOptions = {
  locale?: Locale
  position?: GeoPosition | null
  profileId?: number
  messages?: ChatMessage[]
}

export function useEmotionalOperatingSystem(
  options: UseEmotionalOperatingSystemOptions = {}
): EmotionalOperatingSystem {
  const tick = usePresenceRealtime({ intervalMs: 30_000, activeIntervalMs: 10_000 })
  const world = useEmotionalWorld()

  return useMemo(() => {
    void tick
    void world
    return analyzeEmotionalOperatingSystem({
      locale: options.locale,
      position: options.position,
      profileId: options.profileId,
      messages: options.messages,
      lastActiveAt: getLastActiveAt(),
    })
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

/** Touch activity so continuity knows user is present. */
export function touchEmotionalOsActivity() {
  recordProfileActivity()
}
