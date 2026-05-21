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
} from "@/lib/connection-engine"

export {
  buildConnectionMilestones,
  type TimelineMilestone,
  type TimelineMilestoneId,
} from "@/lib/connection-timeline"

export {
  deriveSyncMetrics,
  syncStatusKey,
  type SyncMetrics,
  type SyncTier,
} from "@/lib/sync-system"

export { getChemistryLabel, getBondLabel, getEnergyLabel } from "@/lib/connection-core-labels"

export type {
  AIConnectionAnalysis,
  AIAtmosphereProfile,
  AIConnectionState,
  ConnectionPersonality,
  AIMemoryMoment,
} from "@/lib/ai-connection-engine"

export {
  extractAIConnectionSignals,
  pickAIInsight,
  getAIConnectionStateLabel,
} from "@/lib/ai-connection-engine"

export {
  buildConnectionAura,
  getRelationshipPersonalityLabel,
  resolveRelationshipPersonality,
  buildRelationshipMoments,
} from "@/lib/relationship-identity"
