"use client"

import { useEmotionalConsciousness } from "@/hooks/use-emotional-consciousness"
import type { EmotionalRealityExpansion } from "@/lib/reality-expansion"
import type { EmotionalOperatingSystem } from "@/lib/emotional-os"
import type { EmotionalConsciousness } from "@/lib/emotional-consciousness"
import type { ChatMessage } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"

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
