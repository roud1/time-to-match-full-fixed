/**
 * Phase 11 — Real Relationship Ecosystem (shared logic for web + future mobile).
 */
export {
  type RelationshipEcosystemStage,
  type StageAtmosphere,
  resolveEcosystemStage,
  getStageAtmosphere,
  getStageProgress,
  ecosystemStageDataAttrs,
  STAGE_LABEL_KEYS,
  STAGE_DESC_KEYS,
} from "@/client/lib/ecosystem/relationship-stages"

export {
  type RelationshipEcology,
  type AttachmentPattern,
  type EvolutionTrend,
  analyzeRelationshipEcology,
} from "@/client/lib/ecosystem/relationship-ecology"

export {
  type EcosystemMemoryItem,
  buildEcosystemMemoryItems,
} from "@/client/lib/ecosystem/memory-items"
