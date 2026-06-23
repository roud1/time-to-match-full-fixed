/**
 * AI Connection Engine — invisible emotional intelligence for Time to Match.
 * Not a chatbot. Analyzes relationships and drives UI atmosphere.
 */

export type {
  AIProvider,
  AIChemistryLevel,
  AIEmotionalState,
  AIConnectionState,
  ConnectionPersonality,
  AIMemoryType,
  AIMemoryMoment,
  AIConnectionSignals,
  AIConnectionAnalysis,
  AIAtmosphereProfile,
  AIConnectionBundle,
} from "@/client/lib/ai-connection-engine/types"

export {
  extractAIConnectionSignals,
  activityLevelFromSignals,
} from "@/client/lib/ai-connection-engine/signals"

export {
  resolveAIConnectionState,
  mapAIEmotionalState,
  getAIConnectionStateLabel,
} from "@/client/lib/ai-connection-engine/states"

export {
  resolveConnectionPersonality,
  getConnectionPersonalityLabel,
} from "@/client/lib/ai-connection-engine/personality"

export { buildAIAtmosphere } from "@/client/lib/ai-connection-engine/atmosphere"

export {
  detectAIMemories,
  mergeAIMemories,
} from "@/client/lib/ai-connection-engine/memory"

export { pickAIInsight } from "@/client/lib/ai-connection-engine/insights"
