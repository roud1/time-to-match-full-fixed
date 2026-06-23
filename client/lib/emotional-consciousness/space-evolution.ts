import { getConnection } from "@/client/lib/connection-store"
import type { ChatMessage } from "@/client/lib/social-store"
import type { RelationshipTension } from "@/client/lib/emotional-consciousness/relationship-tension"
import type { ConsciousnessReading } from "@/client/lib/emotional-consciousness/consciousness-engine"

export type SpaceEvolution = {
  maturity: number
  auraDepth: number
  lightSoftness: number
  resonanceDrift: number
  gradientEase: number
}

export function analyzeSpaceEvolution(
  profileId: number,
  messages: ChatMessage[],
  reading: ConsciousnessReading,
  tension: RelationshipTension
): SpaceEvolution | null {
  const record = getConnection(profileId)
  if (!record) return null

  const days = Math.max(1, (Date.now() - record.matchedAt) / (24 * 60 * 60 * 1000))
  const msgFactor = Math.min(1, messages.length / 24)
  const maturity = Math.min(1, days / 14 * 0.4 + msgFactor * 0.35 + reading.depthSense * 0.25)

  return {
    maturity,
    auraDepth: Math.min(1, 0.3 + maturity * 0.45 + tension.glowTension * 0.15),
    lightSoftness: Math.min(1, 0.4 + maturity * 0.35),
    resonanceDrift: tension.level * 0.4 + reading.consistency * 0.3,
    gradientEase: Math.min(1, 0.5 + maturity * 0.4),
  }
}

export function spaceEvolutionCss(s: SpaceEvolution): Record<string, string> {
  return {
    "--ec-space-maturity": String(s.maturity),
    "--ec-space-aura": String(s.auraDepth),
    "--ec-space-light": String(s.lightSoftness),
    "--ec-space-resonance": String(s.resonanceDrift),
  }
}

export function spaceEvolutionAttrs(s: SpaceEvolution): Record<string, string> {
  return { "data-ec-space-evolution": String(Math.round(s.maturity * 100)) }
}
