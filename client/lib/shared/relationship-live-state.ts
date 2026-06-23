import type { ConnectionView } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"

/** Phase 10 — live relationship states (UI + motion + lighting). */
export type RelationshipLiveState =
  | "growing"
  | "stable"
  | "fading"
  | "intense"
  | "unstable"
  | "deepening"

export type RelationshipStateTokens = {
  state: RelationshipLiveState
  glowOpacity: number
  motionScale: number
  gradientHue: number
  pulseSpeed: number
  dimFactor: number
}

const STATE_HUES: Record<RelationshipLiveState, number> = {
  growing: 245,
  stable: 220,
  fading: 260,
  intense: 280,
  unstable: 35,
  deepening: 265,
}

export function deriveLiveRelationshipState(
  view: ConnectionView,
  analysis?: ConnectionAnalysis | null
): RelationshipLiveState {
  if (view.isFading || view.status === "fading") return "fading"
  if (analysis?.isDecaying || analysis?.emotionalState === "fading") return "fading"

  const chem = analysis?.chemistryPercent ?? 50
  const sync = analysis?.syncPercent ?? 50
  const momentum = analysis?.momentum ?? 0

  if (view.isStable || analysis?.bondLevel === "deep") return "deepening"
  if (view.stage === "stable" || analysis?.bondLevel === "stable") return "stable"

  if (chem >= 78 && momentum > 0.35) return "intense"
  if (analysis?.emotionalState === "distant" || (view.bothParticipated === false && sync < 40)) {
    return "unstable"
  }
  if (view.stage === "strong" || view.stage === "rare" || momentum > 0.2) return "growing"
  if (view.streakDays >= 3) return "growing"

  return "growing"
}

export function getRelationshipStateTokens(state: RelationshipLiveState): RelationshipStateTokens {
  switch (state) {
    case "fading":
      return {
        state,
        glowOpacity: 0.18,
        motionScale: 0.92,
        gradientHue: STATE_HUES.fading,
        pulseSpeed: 0,
        dimFactor: 0.55,
      }
    case "intense":
      return {
        state,
        glowOpacity: 0.72,
        motionScale: 1.08,
        gradientHue: STATE_HUES.intense,
        pulseSpeed: 1.4,
        dimFactor: 1,
      }
    case "unstable":
      return {
        state,
        glowOpacity: 0.32,
        motionScale: 0.98,
        gradientHue: STATE_HUES.unstable,
        pulseSpeed: 0.6,
        dimFactor: 0.75,
      }
    case "deepening":
      return {
        state,
        glowOpacity: 0.58,
        motionScale: 1.02,
        gradientHue: STATE_HUES.deepening,
        pulseSpeed: 0.5,
        dimFactor: 0.95,
      }
    case "stable":
      return {
        state,
        glowOpacity: 0.42,
        motionScale: 1,
        gradientHue: STATE_HUES.stable,
        pulseSpeed: 0.35,
        dimFactor: 0.9,
      }
    case "growing":
    default:
      return {
        state: "growing",
        glowOpacity: 0.5,
        motionScale: 1.04,
        gradientHue: STATE_HUES.growing,
        pulseSpeed: 0.85,
        dimFactor: 1,
      }
  }
}

export function relationshipStateDataAttrs(tokens: RelationshipStateTokens): Record<string, string> {
  return {
    "data-rel-state": tokens.state,
    "data-rel-glow": String(tokens.glowOpacity),
    "data-rel-dim": String(tokens.dimFactor),
  }
}
