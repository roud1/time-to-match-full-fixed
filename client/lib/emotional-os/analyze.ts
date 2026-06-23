import { computeEmotionalWorldState } from "@/client/lib/world/world-state"
import { getGlobalAtmosphere } from "@/client/lib/world/global-atmosphere"
import { analyzeConnectionHub } from "@/client/lib/emotional-os/connection-hub"
import {
  orchestrateEmotionalExperience,
  orchestrationAttrs,
  orchestrationCss,
} from "@/client/lib/emotional-os/orchestrator"
import {
  deriveAtmosphereNetwork,
  networkAttrs,
  networkCss,
} from "@/client/lib/emotional-os/atmosphere-network"
import {
  analyzeRelationshipRealityField,
  realityFieldAttrs,
  realityFieldCss,
} from "@/client/lib/emotional-os/relationship-reality"
import {
  analyzeEmotionalMemoryField,
  memoryFieldCss,
} from "@/client/lib/emotional-os/memory-engine"
import {
  deriveEmotionalContinuity,
  continuityAttrs,
  continuityCss,
} from "@/client/lib/emotional-os/continuity"
import { deriveMotionLightPass, motionLightCss } from "@/client/lib/emotional-os/motion-light"
import type { EmotionalOperatingSystem } from "@/client/lib/emotional-os/types"
import type { ChatMessage } from "@/client/lib/social-store"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"

export function analyzeEmotionalOperatingSystem(options?: {
  hour?: number
  locale?: Locale
  position?: GeoPosition | null
  profileId?: number
  messages?: ChatMessage[]
  lastActiveAt?: number
}): EmotionalOperatingSystem {
  const hour = options?.hour ?? new Date().getHours()
  const world = computeEmotionalWorldState(hour)
  const atmosphere = getGlobalAtmosphere(hour)
  const hub = analyzeConnectionHub({
    locale: options?.locale,
    position: options?.position,
  })
  const orchestration = orchestrateEmotionalExperience(hub, world, hour)
  const network = deriveAtmosphereNetwork(hub, atmosphere, hour)
  const memory = analyzeEmotionalMemoryField()
  const offlineMs = options?.lastActiveAt
    ? Math.max(0, Date.now() - options.lastActiveAt)
    : 0
  const continuity = deriveEmotionalContinuity(hub, offlineMs)
  const motionLight = deriveMotionLightPass(orchestration, network)

  const reality =
    options?.profileId != null
      ? analyzeRelationshipRealityField(
          options.profileId,
          options.messages ?? [],
          hub
        )
      : null

  const style: Record<string, string> = {
    ...orchestrationCss(orchestration),
    ...networkCss(network),
    ...memoryFieldCss(memory),
    ...continuityCss(continuity),
    ...motionLightCss(motionLight),
    "--eo-platform-sync": String(hub.platformSync),
    "--eo-chemistry": String(hub.chemistryIndex),
    "--eo-rhythm": String(hub.rhythmIndex),
    ...(reality ? realityFieldCss(reality) : {}),
  }

  const attrs: Record<string, string> = {
    ...orchestrationAttrs(orchestration),
    ...networkAttrs(network),
    ...continuityAttrs(continuity),
    "data-emotional-os": "true",
    "data-eo-evolution": hub.evolutionMaturity,
    ...(reality ? realityFieldAttrs(reality) : {}),
  }

  return {
    hub,
    orchestration,
    network,
    reality,
    memory,
    continuity,
    motionLight,
    style,
    attrs,
  }
}
