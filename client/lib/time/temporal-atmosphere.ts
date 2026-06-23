import type { TimeFlowTokens } from "@/client/lib/time/time-flow"
import type { TimeEvolution } from "@/client/lib/time/time-evolution"
import type { ConnectionTimeRhythm } from "@/client/lib/time/connection-rhythm-engine"
import type { RelationshipTimeState } from "@/client/lib/time/relationship-time-state"

export function mergeTemporalAtmosphere(
  flow: TimeFlowTokens,
  evolution: TimeEvolution,
  rhythm: ConnectionTimeRhythm,
  timeState: RelationshipTimeState
): Record<string, string> {
  let glow = flow.glow * (1 - evolution.atmosphereDim * 0.35)
  let motion = flow.motion * rhythm.pacing

  if (timeState.id === "deep_night_energy") {
    glow *= 1.12
    motion *= 0.92
  } else if (timeState.id === "fading_connection") {
    glow *= 0.72
    motion *= 0.8
  } else if (timeState.id === "stable_presence") {
    motion *= 0.88
  }

  return {
    "--time-merged-glow": String(Math.min(1, glow)),
    "--time-merged-motion": String(motion),
  }
}
