import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { EmotionalWorldState } from "@/client/lib/world/world-state"
import type { TranslationKey } from "@/client/lib/i18n"

export type OrchestrationPacing = "still" | "soft" | "balanced" | "surge"
export type OrchestrationLighting = "intimate" | "warm" | "neutral" | "distant"

/** AI emotional director — atmosphere, pacing, tone (Phase 20). */
export type EmotionalOrchestration = {
  pacing: OrchestrationPacing
  uiDensity: number
  atmosphereShift: number
  transitionMs: number
  lighting: OrchestrationLighting
  motionScale: number
  whisperKey: TranslationKey | null
}

export function orchestrateEmotionalExperience(
  hub: ConnectionHubSnapshot,
  world: EmotionalWorldState,
  hour = new Date().getHours()
): EmotionalOrchestration {
  const isNight = hour >= 22 || hour < 5
  const sync = hub.platformSync
  const energy = Math.max(hub.energyIndex, world.energy * 100)

  let pacing: OrchestrationPacing = "soft"
  let lighting: OrchestrationLighting = "warm"
  let whisperKey: TranslationKey | null = null

  if (hub.activeCount === 0) {
    return {
      pacing: isNight ? "still" : "soft",
      uiDensity: 0.35,
      atmosphereShift: 0.12,
      transitionMs: 1200,
      lighting: isNight ? "intimate" : "neutral",
      motionScale: world.atmosphere.motionScale * 0.85,
      whisperKey: "eoWorldEnter",
    }
  }

  if (hub.hasFading && sync < 35) {
    pacing = "still"
    lighting = "distant"
    whisperKey = "eoOrchestratorSoftening"
  } else if (sync >= 75 && hub.chemistryIndex >= 60) {
    pacing = "surge"
    lighting = "intimate"
    whisperKey = isNight ? "eoOrchestratorNight" : "eoOrchestratorIntense"
  } else if (hub.evolutionMaturity === "deep" || hub.evolutionMaturity === "established") {
    pacing = "balanced"
    lighting = "intimate"
    whisperKey = "eoOrchestratorBonded"
  } else if (isNight) {
    pacing = "soft"
    lighting = "intimate"
    whisperKey = "eoOrchestratorNight"
  } else {
    pacing = "balanced"
    whisperKey = "eoOrchestratorCalm"
  }

  const atmosphereShift = Math.min(
    1,
    0.15 + sync / 200 + (hub.hasStable ? 0.12 : 0) + world.pulse * 0.2
  )

  return {
    pacing,
    uiDensity: Math.min(1, 0.4 + sync / 120 + hub.attachmentDepth / 200),
    atmosphereShift,
    transitionMs: pacing === "surge" ? 700 : pacing === "still" ? 1400 : 950,
    lighting,
    motionScale: world.atmosphere.motionScale * (pacing === "surge" ? 1.08 : pacing === "still" ? 0.82 : 1),
    whisperKey,
  }
}

export function orchestrationCss(o: EmotionalOrchestration): Record<string, string> {
  return {
    "--eo-pacing": o.pacing,
    "--eo-ui-density": String(o.uiDensity),
    "--eo-atmo-shift": String(o.atmosphereShift),
    "--eo-transition-ms": String(o.transitionMs),
    "--eo-lighting": o.lighting,
    "--eo-motion-scale": String(o.motionScale),
  }
}

export function orchestrationAttrs(o: EmotionalOrchestration): Record<string, string> {
  return {
    "data-eo-pacing": o.pacing,
    "data-eo-lighting": o.lighting,
    "data-eo-orchestrator": "true",
  }
}
