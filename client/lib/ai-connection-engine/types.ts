import type { BondLevel, ChemistryLevel } from "@/client/lib/connection-engine"

/** Invisible AI layer — never shown as a chatbot. */
export type AIProvider = "openrouter" | "local"

/** Chemistry from model (intense maps to peak in merge). */
export type AIChemistryLevel = ChemistryLevel | "intense"

export type AIEmotionalState =
  | "curious"
  | "warming"
  | "deepening"
  | "aligned"
  | "tension"
  | "distant"
  | "fading"

/** Smart connection state — drives UI labels & atmosphere. */
export type AIConnectionState =
  | "growing_connection"
  | "stable_bond"
  | "deep_chemistry"
  | "emotional_tension"
  | "fading_energy"
  | "high_compatibility"

import type {
  RelationshipPersonality,
  LegacyConnectionPersonality,
} from "@/client/lib/relationship-identity/types"

export type ConnectionPersonality = RelationshipPersonality | LegacyConnectionPersonality

export type AIMemoryType =
  | "first_deep_talk"
  | "long_night"
  | "high_interaction"
  | "strong_chemistry"

export type AIMemoryMoment = {
  id: AIMemoryType
  at: number
  label: string
  importance: number
}

/** Rich signals sent to /api/analyze-connection. */
export type AIConnectionSignals = {
  avgReplyMs: number | null
  medianReplyMs: number | null
  replyConsistency: number
  avgMessageLength: number
  interactionDepth: number
  mutualEngagement: number
  lateNightRatio: number
  dailyConsistency: number
  emotionalIntensity: number
  oneSidedRatio: number
  sessionDepth: number
  fastReplyCount: number
  messageCount: number
}

/** Full AI engine response (public, no secrets). */
export type AIConnectionAnalysis = {
  sync: number
  chemistry: AIChemistryLevel
  bond: BondLevel
  energy: "growing" | "steady" | "cooling" | "fading"
  emotionalState: AIEmotionalState
  connectionState: AIConnectionState
  personality: ConnectionPersonality
  insight: string
  atmosphereLevel: number
  memories: AIMemoryMoment[]
  source: AIProvider
  analyzedAt: number
}

/** UI atmosphere tokens derived from AI. */
export type AIAtmosphereProfile = {
  level: number
  glow: number
  motion: number
  particles: number
  warmth: number
  depth: number
  tier: "cold" | "soft" | "active" | "vibrant" | "synced"
  connectionState: AIConnectionState
  personality: ConnectionPersonality
  emotionalState: AIEmotionalState
}

export type AIConnectionBundle = {
  ai: AIConnectionAnalysis | null
  atmosphere: AIAtmosphereProfile
  loading: boolean
}
