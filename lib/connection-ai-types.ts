import type {
  AIConnectionAnalysis,
  AIConnectionSignals,
  AIMemoryMoment,
  AIConnectionState,
  AIEmotionalState,
  ConnectionPersonality,
  AIChemistryLevel,
} from "@/lib/ai-connection-engine/types"
import type { BondLevel } from "@/lib/connection-engine"
import type { Locale } from "@/lib/i18n/config"

/** @deprecated use AIConnectionAnalysis */
export type ConnectionAIAnalysisResponse = AIConnectionAnalysis

export type AnalyzeConnectionMessage = {
  from: "me" | "them"
  text: string
  at: number
}

/** Request body for POST /api/analyze-connection */
export type AnalyzeConnectionRequest = {
  profileId: number
  locale?: Locale
  messages: AnalyzeConnectionMessage[]
  responseTimes: number[]
  activityLevel: "low" | "medium" | "high"
  conversationLength: number
  mutualInteraction: boolean
  lateNightActivity: boolean
  stage?: string
  streakDays?: number
  signals?: AIConnectionSignals
}

export type {
  AIConnectionAnalysis,
  AIConnectionSignals,
  AIMemoryMoment,
  AIConnectionState,
  AIEmotionalState,
  ConnectionPersonality,
  AIChemistryLevel,
}
