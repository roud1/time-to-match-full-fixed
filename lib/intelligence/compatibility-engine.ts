import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionSignals } from "@/lib/connection-engine"

export type CompatibilityIntelligence = {
  compatibilityScore: number
  emotionalResonance: number
  longTermPotential: number
  tempoScore: number
  depthScore: number
  energyBalance: number
  consistencyScore: number
}

function clamp(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function computeCompatibilityIntelligence(
  analysis: ConnectionAnalysis,
  signals: ConnectionSignals
): CompatibilityIntelligence {
  const tempoScore = clamp(
    (signals.fastReplyCount > 0 ? 35 : 15) +
      (signals.avgReplyMs != null && signals.avgReplyMs < 20 * 60 * 1000 ? 30 : 10) +
      Math.min(25, signals.mutualSessions * 8)
  )

  const depthScore = clamp(
    analysis.bondPercent * 0.45 +
      Math.min(30, signals.longestSessionMessages * 4) +
      signals.voiceLikeCount * 5 +
      signals.nightMessageCount * 2
  )

  const energyBalance = clamp((1 - Math.abs(signals.oneSidedRatio - 0.5) * 2) * 100)

  const consistencyScore = clamp(
    signals.dailyStreak * 12 + analysis.bondPercent * 0.35 + (analysis.isDecaying ? -15 : 10)
  )

  const emotionalResonance = clamp(
    analysis.syncPercent * 0.4 +
      analysis.chemistryPercent * 0.25 +
      tempoScore * 0.15 +
      energyBalance * 0.2
  )

  const compatibilityScore = clamp(
    emotionalResonance * 0.45 +
      depthScore * 0.25 +
      consistencyScore * 0.2 +
      energyBalance * 0.1
  )

  const longTermPotential = clamp(
    compatibilityScore * 0.5 +
      (analysis.bondLevel === "deep" || analysis.bondLevel === "stable" ? 28 : 12) +
      (signals.mutualSessions >= 3 ? 15 : 0) -
      (analysis.isDecaying ? 20 : 0)
  )

  return {
    compatibilityScore,
    emotionalResonance,
    longTermPotential,
    tempoScore,
    depthScore,
    energyBalance,
    consistencyScore,
  }
}
