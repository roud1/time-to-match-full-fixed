/**
 * Connection Core — emotional relationship engine for Time to Match.
 * Single entry point for sync, chemistry, bond, and connection energy.
 */

export {
  extractSignals,
  analyzeConnection,
  analysisToSyncMetrics,
  tierFromPercent,
  type ConnectionSignals,
  type ConnectionAnalysis,
  type EmotionalState,
  type ChemistryLevel,
  type BondLevel,
} from "@/client/lib/connection-engine"

export {
  buildConnectionMilestones,
  type TimelineMilestone,
  type TimelineMilestoneId,
} from "@/client/lib/connection-timeline"

export {
  deriveSyncMetrics,
  syncStatusKey,
  type SyncMetrics,
  type SyncTier,
} from "@/client/lib/sync-system"

export { getChemistryLabel, getBondLabel, getEnergyLabel } from "@/client/lib/connection-core-labels"

export type {
  AIConnectionAnalysis,
  AIAtmosphereProfile,
  AIConnectionState,
  ConnectionPersonality,
  AIMemoryMoment,
} from "@/client/lib/ai-connection-engine"

export {
  extractAIConnectionSignals,
  pickAIInsight,
  getAIConnectionStateLabel,
} from "@/client/lib/ai-connection-engine"

export {
  buildConnectionAura,
  getRelationshipPersonalityLabel,
  resolveRelationshipPersonality,
  buildRelationshipMoments,
} from "@/client/lib/relationship-identity"
