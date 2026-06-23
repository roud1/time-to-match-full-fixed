import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import type { RelationshipTimeState } from "@/client/lib/time/relationship-time-state"

export type TimeEvolutionTrend = "deepening" | "steady" | "cooling" | "dormant"

export type TimeEvolution = {
  trend: TimeEvolutionTrend
  bondAgeDays: number
  idleHours: number
  nightStrength: number
  consistency: number
  auraDepth: number
  atmosphereDim: number
}

export function deriveTimeEvolution(
  record: ConnectionRecord,
  analysis: ConnectionAnalysis,
  messages: ChatMessage[],
  timeState: RelationshipTimeState,
  now = Date.now()
): TimeEvolution {
  const bondAgeDays = Math.max(0, (now - record.matchedAt) / (24 * 60 * 60 * 1000))
  const idleHours = Math.max(0, (now - record.lastInteractionAt) / (60 * 60 * 1000))
  const nightStrength = Math.min(1, nightCount(messages) / 8)
  const consistency = Math.min(1, record.streakDays / 7)

  let trend: TimeEvolutionTrend = "steady"
  if (idleHours > 8 || analysis.isDecaying) trend = "dormant"
  else if (analysis.momentum > 0.15 || nightStrength > 0.4) trend = "deepening"
  else if (idleHours > 3 || timeState.id === "fading_connection") trend = "cooling"

  const auraDepth = Math.min(
    1,
    bondAgeDays * 0.08 + consistency * 0.35 + nightStrength * 0.25 + analysis.bondPercent / 200
  )
  const atmosphereDim = Math.min(1, idleHours / 12) * (trend === "dormant" ? 0.5 : 0.25)

  return {
    trend,
    bondAgeDays,
    idleHours,
    nightStrength,
    consistency,
    auraDepth,
    atmosphereDim,
  }
}

function nightCount(messages: ChatMessage[]) {
  return messages.filter((m) => {
    const h = new Date(m.at).getHours()
    return h >= 22 || h < 5
  }).length
}

export function evolutionCss(evolution: TimeEvolution): Record<string, string> {
  return {
    "--time-aura-depth": String(evolution.auraDepth),
    "--time-atmo-dim": String(evolution.atmosphereDim),
    "--time-consistency": String(evolution.consistency),
  }
}

export function evolutionAttrs(evolution: TimeEvolution): Record<string, string> {
  return { "data-time-trend": evolution.trend }
}
