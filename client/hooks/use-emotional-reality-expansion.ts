"use client"

import { useEmotionalConsciousness } from "@/client/hooks/use-emotional-consciousness"
import type { EmotionalRealityExpansion } from "@/client/lib/reality-expansion"
import type { EmotionalOperatingSystem } from "@/client/lib/emotional-os"
import type { EmotionalConsciousness } from "@/client/lib/emotional-consciousness"
import type { ChatMessage } from "@/client/lib/social-store"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"

type UseEmotionalRealityExpansionOptions = {
  locale?: Locale
  position?: GeoPosition | null
  profileId?: number
  messages?: ChatMessage[]
}

export type EmotionalRealityExpansionBundle = EmotionalRealityExpansion & {
  os: EmotionalOperatingSystem
  consciousness: EmotionalConsciousness
}

/** Phase 20–22 bundle — OS, reality expansion, consciousness. */
export function useEmotionalRealityExpansion(
  options: UseEmotionalRealityExpansionOptions = {}
): EmotionalRealityExpansionBundle {
  const bundle = useEmotionalConsciousness(options)
  const { os, expansion, ...consciousness } = bundle
  return { ...expansion, os, consciousness }
}
