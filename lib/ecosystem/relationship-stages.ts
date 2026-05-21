import type { ConnectionView, ConnectionStage } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionEvolutionStage } from "@/lib/relationship-identity/types"
import type { TranslationKey } from "@/lib/i18n"

/** Phase 11 — user-facing relationship stages (ecosystem). */
export type RelationshipEcosystemStage =
  | "new_connection"
  | "growing_energy"
  | "stable_bond"
  | "deep_chemistry"
  | "emotional_resonance"
  | "high_sync"

export type StageAtmosphere = {
  level: number
  glowMul: number
  particleMul: number
  blurDepth: number
  waveSpeed: number
  motionScale: number
}

const STAGE_ORDER: RelationshipEcosystemStage[] = [
  "new_connection",
  "growing_energy",
  "stable_bond",
  "deep_chemistry",
  "emotional_resonance",
  "high_sync",
]

const STAGE_RANK: Record<RelationshipEcosystemStage, number> = {
  new_connection: 0,
  growing_energy: 1,
  stable_bond: 2,
  deep_chemistry: 3,
  emotional_resonance: 4,
  high_sync: 5,
}

const ATMOSPHERE: Record<RelationshipEcosystemStage, StageAtmosphere> = {
  new_connection: {
    level: 0.22,
    glowMul: 0.35,
    particleMul: 0.15,
    blurDepth: 0,
    waveSpeed: 0.4,
    motionScale: 0.92,
  },
  growing_energy: {
    level: 0.45,
    glowMul: 0.55,
    particleMul: 0.35,
    blurDepth: 1,
    waveSpeed: 0.7,
    motionScale: 1,
  },
  stable_bond: {
    level: 0.58,
    glowMul: 0.5,
    particleMul: 0.3,
    blurDepth: 1,
    waveSpeed: 0.5,
    motionScale: 0.98,
  },
  deep_chemistry: {
    level: 0.72,
    glowMul: 0.75,
    particleMul: 0.55,
    blurDepth: 2,
    waveSpeed: 0.85,
    motionScale: 1.04,
  },
  emotional_resonance: {
    level: 0.85,
    glowMul: 0.88,
    particleMul: 0.7,
    blurDepth: 2,
    waveSpeed: 1,
    motionScale: 1.06,
  },
  high_sync: {
    level: 1,
    glowMul: 1,
    particleMul: 0.9,
    blurDepth: 3,
    waveSpeed: 1.15,
    motionScale: 1.1,
  },
}

export const STAGE_LABEL_KEYS: Record<RelationshipEcosystemStage, TranslationKey> = {
  new_connection: "ecoStageNew",
  growing_energy: "ecoStageGrowing",
  stable_bond: "ecoStageStable",
  deep_chemistry: "ecoStageDeepChem",
  emotional_resonance: "ecoStageResonance",
  high_sync: "ecoStageHighSync",
}

export const STAGE_DESC_KEYS: Record<RelationshipEcosystemStage, TranslationKey> = {
  new_connection: "ecoStageNewDesc",
  growing_energy: "ecoStageGrowingDesc",
  stable_bond: "ecoStageStableDesc",
  deep_chemistry: "ecoStageDeepChemDesc",
  emotional_resonance: "ecoStageResonanceDesc",
  high_sync: "ecoStageHighSyncDesc",
}

export function resolveEcosystemStage(
  view: ConnectionView,
  analysis: ConnectionAnalysis | null,
  evolutionStage: ConnectionEvolutionStage
): RelationshipEcosystemStage {
  const sync = analysis?.syncPercent ?? 0
  const connStage = view.stage

  if (view.isFading) return sync >= 40 ? "growing_energy" : "new_connection"

  if (view.isStable || connStage === "stable") return "stable_bond"

  if (evolutionStage === "peak" || sync >= 90) {
    return sync >= 94 ? "high_sync" : "emotional_resonance"
  }

  if (evolutionStage === "deepening" || connStage === "rare" || connStage === "strong") {
    if (sync >= 78) return "emotional_resonance"
    return "deep_chemistry"
  }

  if (evolutionStage === "growing" || connStage === "active") {
    return "growing_energy"
  }

  return "new_connection"
}

export function stageFromConnectionStage(stage: ConnectionStage, sync: number): RelationshipEcosystemStage {
  if (stage === "stable") return "stable_bond"
  if (stage === "rare") return sync >= 85 ? "emotional_resonance" : "deep_chemistry"
  if (stage === "strong") return "deep_chemistry"
  if (stage === "active") return "growing_energy"
  return "new_connection"
}

export function getStageAtmosphere(stage: RelationshipEcosystemStage): StageAtmosphere {
  return ATMOSPHERE[stage]
}

export function getStageProgress(
  stage: RelationshipEcosystemStage,
  evolutionProgress: number
): number {
  const base = (STAGE_RANK[stage] + 0.35) / STAGE_ORDER.length
  return Math.min(1, base * 0.6 + evolutionProgress * 0.4)
}

export function ecosystemStageDataAttrs(
  stage: RelationshipEcosystemStage,
  atmosphere: StageAtmosphere
): Record<string, string> {
  return {
    "data-eco-stage": stage,
    "data-eco-level": String(Math.round(atmosphere.level * 100)),
  }
}
