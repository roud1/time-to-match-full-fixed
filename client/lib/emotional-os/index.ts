/**
 * Phase 20 — Emotional Operating System Layer.
 * Unified orchestration for connection, atmosphere, motion, and memory.
 */
export type { EmotionalOperatingSystem } from "@/client/lib/emotional-os/types"

export {
  type ConnectionHubSnapshot,
  analyzeConnectionHub,
} from "@/client/lib/emotional-os/connection-hub"

export {
  type EmotionalOrchestration,
  type OrchestrationPacing,
  type OrchestrationLighting,
  orchestrateEmotionalExperience,
  orchestrationCss,
  orchestrationAttrs,
} from "@/client/lib/emotional-os/orchestrator"

export {
  type AtmosphereNetworkState,
  type PlatformMood,
  deriveAtmosphereNetwork,
  networkCss,
  networkAttrs,
} from "@/client/lib/emotional-os/atmosphere-network"

export {
  type RelationshipRealityField,
  analyzeRelationshipRealityField,
  realityFieldCss,
  realityFieldAttrs,
} from "@/client/lib/emotional-os/relationship-reality"

export {
  type EmotionalMemoryField,
  analyzeEmotionalMemoryField,
  memoryFieldCss,
} from "@/client/lib/emotional-os/memory-engine"

export {
  type EmotionalContinuity,
  deriveEmotionalContinuity,
  continuityCss,
  continuityAttrs,
} from "@/client/lib/emotional-os/continuity"

export {
  type MotionLightPass,
  deriveMotionLightPass,
  motionLightCss,
} from "@/client/lib/emotional-os/motion-light"

export { analyzeEmotionalOperatingSystem } from "@/client/lib/emotional-os/analyze"
