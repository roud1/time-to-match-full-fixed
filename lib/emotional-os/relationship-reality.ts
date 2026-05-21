import { getConnection } from "@/lib/connection-store"
import { buildConnectionView } from "@/lib/connection-system"
import { analyzeConnection } from "@/lib/connection-engine"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"

/** Per-connection emotional reality field — resonance + environment depth. */
export type RelationshipRealityField = {
  profileId: number
  resonanceLevel: number
  environmentDepth: number
  auraIntensity: number
  cinematicDepth: number
}

export function analyzeRelationshipRealityField(
  profileId: number,
  messages: ChatMessage[],
  hub: ConnectionHubSnapshot
): RelationshipRealityField | null {
  const record = getConnection(profileId)
  if (!record) return null

  const view = buildConnectionView(record)
  const analysis = analyzeConnection(view, messages, record)
  const platformBoost = hub.platformSync / 200

  const resonanceLevel = Math.min(
    1,
    analysis.syncPercent / 100 * 0.55 + analysis.chemistryPercent / 100 * 0.25 + platformBoost
  )

  return {
    profileId,
    resonanceLevel,
    environmentDepth: Math.min(1, 0.3 + analysis.bondPercent / 120 + view.auraTier * 0.12),
    auraIntensity: Math.min(1, 0.25 + resonanceLevel * 0.65),
    cinematicDepth: view.isStable ? 0.75 : view.isFading ? 0.35 : 0.55,
  }
}

export function realityFieldCss(f: RelationshipRealityField): Record<string, string> {
  return {
    "--eo-resonance": String(f.resonanceLevel),
    "--eo-env-depth": String(f.environmentDepth),
    "--eo-aura-intensity": String(f.auraIntensity),
    "--eo-cine-depth": String(f.cinematicDepth),
  }
}

export function realityFieldAttrs(f: RelationshipRealityField): Record<string, string> {
  return {
    "data-eo-reality": "true",
    "data-eo-resonance-tier": f.resonanceLevel >= 0.7 ? "high" : f.resonanceLevel >= 0.4 ? "mid" : "low",
  }
}
