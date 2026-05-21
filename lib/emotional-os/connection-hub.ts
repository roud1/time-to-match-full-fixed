import { getActiveConnections } from "@/lib/connection-store"
import { buildConnectionView } from "@/lib/connection-system"
import { analyzeConnection } from "@/lib/connection-engine"
import type { EmotionalState } from "@/lib/connection-engine"
import type { EvolutionMaturity } from "@/lib/world/relationship-evolution"
import { analyzeRelationshipEvolution } from "@/lib/world/relationship-evolution"
import { getChats, type ChatThread } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"

/** Universal connection engine snapshot — platform-wide bond pulse. */
export type ConnectionHubSnapshot = {
  activeCount: number
  platformSync: number
  chemistryIndex: number
  rhythmIndex: number
  energyIndex: number
  evolutionMaturity: EvolutionMaturity | "dormant"
  dominantEmotionalState: EmotionalState
  hasFading: boolean
  hasStable: boolean
  attachmentDepth: number
}

function emptyHub(): ConnectionHubSnapshot {
  return {
    activeCount: 0,
    platformSync: 0,
    chemistryIndex: 0,
    rhythmIndex: 0,
    energyIndex: 0,
    evolutionMaturity: "dormant",
    dominantEmotionalState: "curious",
    hasFading: false,
    hasStable: false,
    attachmentDepth: 0,
  }
}

export function analyzeConnectionHub(options?: {
  locale?: Locale
  position?: GeoPosition | null
  threads?: ChatThread[]
}): ConnectionHubSnapshot {
  if (typeof window === "undefined") return emptyHub()

  const connections = getActiveConnections()
  if (connections.length === 0) return emptyHub()

  const threads =
    options?.threads ??
    (options?.locale
      ? getChats(options.locale, options.position ?? null)
      : [])

  const threadByProfile = new Map(threads.map((t) => [t.profileId, t]))

  let syncSum = 0
  let chemSum = 0
  let energySum = 0
  let rhythmSum = 0
  let depthSum = 0
  let fading = false
  let stable = false
  const stateCounts = new Map<EmotionalState, number>()
  let bestMaturity: EvolutionMaturity = "forming"
  const maturityRank: Record<EvolutionMaturity, number> = {
    forming: 0,
    developing: 1,
    established: 2,
    deep: 3,
    renewing: 1,
  }

  for (const record of connections) {
    const view = buildConnectionView(record)
    const messages = threadByProfile.get(record.profileId)?.messages ?? []
    const analysis = analyzeConnection(view, messages, record)
    syncSum += analysis.syncPercent
    chemSum += analysis.chemistryPercent
    energySum += analysis.energyPercent
    rhythmSum += analysis.momentum
    depthSum += analysis.bondPercent
    fading = fading || view.isFading
    stable = stable || view.isStable
    stateCounts.set(analysis.emotionalState, (stateCounts.get(analysis.emotionalState) ?? 0) + 1)

    const evo = analyzeRelationshipEvolution(view, analysis, messages, record)
    if (maturityRank[evo.maturity] > maturityRank[bestMaturity]) {
      bestMaturity = evo.maturity
    }
  }

  const n = connections.length
  let dominant: EmotionalState = "curious"
  let max = 0
  for (const [state, count] of stateCounts) {
    if (count > max) {
      max = count
      dominant = state
    }
  }

  return {
    activeCount: n,
    platformSync: Math.round(syncSum / n),
    chemistryIndex: Math.round(chemSum / n),
    rhythmIndex: Math.round(Math.min(100, rhythmSum / n)),
    energyIndex: Math.round(energySum / n),
    evolutionMaturity: bestMaturity,
    dominantEmotionalState: dominant,
    hasFading: fading,
    hasStable: stable,
    attachmentDepth: Math.round(depthSum / n),
  }
}
