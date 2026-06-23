import type { TranslationKey } from "@/client/lib/i18n"
import { getActiveConnections } from "@/client/lib/connection-store"
import { buildConnectionView } from "@/client/lib/connection-system"
import { getGlobalAtmosphere } from "@/client/lib/world/global-atmosphere"
import { computeEmotionalWorldState } from "@/client/lib/world/world-state"

/** Subtle platform whispers — not a social feed. */
export type EnergyWhisper = {
  id: string
  messageKey: TranslationKey
  priority: number
}

export function buildEnergyWhispers(): EnergyWhisper[] {
  const whispers: EnergyWhisper[] = []
  const world = computeEmotionalWorldState()
  const atmosphere = getGlobalAtmosphere()
  const connections = getActiveConnections()

  if (connections.length === 0) return whispers

  const avgSync =
    connections.reduce((sum, c) => {
      const v = buildConnectionView(c)
      return sum + v.streakScore
    }, 0) / connections.length

  if (atmosphere.period === "evening" && connections.length >= 1) {
    whispers.push({
      id: "evolving-tonight",
      messageKey: "netWhisperEvolvingTonight",
      priority: 80,
    })
  }

  if (world.pulse >= 0.45) {
    whispers.push({
      id: "high-activity",
      messageKey: "netWhisperHighActivity",
      priority: 70,
    })
  }

  if (avgSync >= 70) {
    whispers.push({
      id: "sync-energy",
      messageKey: "netWhisperSyncEnergy",
      priority: 65,
    })
  }

  const fading = connections.filter((c) => buildConnectionView(c).isFading).length
  if (fading > 0 && fading < connections.length) {
    whispers.push({
      id: "some-fading",
      messageKey: "netWhisperSomeFading",
      priority: 40,
    })
  }

  return whispers.sort((a, b) => b.priority - a.priority).slice(0, 1)
}
