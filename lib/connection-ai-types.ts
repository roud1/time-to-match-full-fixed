import type { BondLevel, ChemistryLevel } from "@/lib/connection-engine"

/** Public API response — safe to use on client. */
export type ConnectionAIAnalysisResponse = {
  sync: number
  chemistry: ChemistryLevel
  bond: BondLevel
  energy: "growing" | "steady" | "cooling" | "fading"
  insight: string
  source: "openrouter" | "local"
  analyzedAt: number
}

export type AnalyzeConnectionMessage = {
  from: "me" | "them"
  text: string
  at: number
}

/** Request body for POST /api/analyze-connection */
export type AnalyzeConnectionRequest = {
  profileId: number
  locale?: string
  messages: AnalyzeConnectionMessage[]
  responseTimes: number[]
  activityLevel: "low" | "medium" | "high"
  conversationLength: number
  mutualInteraction: boolean
  lateNightActivity: boolean
  stage?: string
  streakDays?: number
}
