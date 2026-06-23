import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { EmotionalOrchestration } from "@/client/lib/emotional-os/orchestrator"
import type { AtmosphereNetworkState } from "@/client/lib/emotional-os/atmosphere-network"
import type { RelationshipRealityField } from "@/client/lib/emotional-os/relationship-reality"
import type { EmotionalMemoryField } from "@/client/lib/emotional-os/memory-engine"
import type { EmotionalContinuity } from "@/client/lib/emotional-os/continuity"
import type { MotionLightPass } from "@/client/lib/emotional-os/motion-light"

/** Phase 20 — unified emotional operating system state. */
export type EmotionalOperatingSystem = {
  hub: ConnectionHubSnapshot
  orchestration: EmotionalOrchestration
  network: AtmosphereNetworkState
  reality: RelationshipRealityField | null
  memory: EmotionalMemoryField
  continuity: EmotionalContinuity
  motionLight: MotionLightPass
  style: Record<string, string>
  attrs: Record<string, string>
}
