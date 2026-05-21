/**
 * Phase 20 — Emotional Operating System Layer.
 * Unified orchestration for connection, atmosphere, motion, and memory.
 */
export type { EmotionalOperatingSystem } from "@/lib/emotional-os/types"

export {
  type ConnectionHubSnapshot,
  analyzeConnectionHub,
} from "@/lib/emotional-os/connection-hub"

export {
  type EmotionalOrchestration,
  type OrchestrationPacing,
  type OrchestrationLighting,
  orchestrateEmotionalExperience,
  orchestrationCss,
  orchestrationAttrs,
} from "@/lib/emotional-os/orchestrator"

export {
  type AtmosphereNetworkState,
  type PlatformMood,
  deriveAtmosphereNetwork,
  networkCss,
  networkAttrs,
} from "@/lib/emotional-os/atmosphere-network"

export {
  type RelationshipRealityField,
  analyzeRelationshipRealityField,
  realityFieldCss,
  realityFieldAttrs,
} from "@/lib/emotional-os/relationship-reality"

export {
  type EmotionalMemoryField,
  analyzeEmotionalMemoryField,
  memoryFieldCss,
} from "@/lib/emotional-os/memory-engine"

export {
  type EmotionalContinuity,
  deriveEmotionalContinuity,
  continuityCss,
  continuityAttrs,
} from "@/lib/emotional-os/continuity"

export {
  type MotionLightPass,
  deriveMotionLightPass,
  motionLightCss,
} from "@/lib/emotional-os/motion-light"

export { analyzeEmotionalOperatingSystem } from "@/lib/emotional-os/analyze"
