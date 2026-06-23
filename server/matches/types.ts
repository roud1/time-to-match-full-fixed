import type { GamificationSnapshot } from "@/server/gamification/types"
import type { MatchStatus } from "@/server/match-engine/types"

export type MatchBondStats = {
  totalMessages: number
  prolongCount: number
  bondLevel: number
  /** 0–1 progress toward the next bond prolong (every 50 messages). */
  bondProgress: number
  /** Messages left until +6h prolong (0 = at threshold / just prolonged). */
  messagesUntilNext: number
  lastProlongedAt: string | null
}

export type MatchDto = {
  id: string
  peerUserId: string
  peerName: string | null
  expiresAt: string
  isFrozen: boolean
  isExpired: boolean
  /** Canonical engine status (24h lifecycle). */
  status?: MatchStatus
  bond: MatchBondStats
}

export type MessageSentResponse = {
  prolonged: boolean
  newExpiresAt?: string
  bondLevel: number
  totalMessages: number
  bondProgress: number
  prolongCount: number
  messagesUntilNext: number
  addedHours?: number
  systemMessage?: string
  gamification?: GamificationSnapshot
  /** True when OpenRouter analysis was queued on a message threshold. */
  analysisQueued?: boolean
}

export type FreezeMatchResponse = {
  match: MatchDto
  gamification?: GamificationSnapshot
}

export type FreezeMatchErrorCode = "freeze_cooldown" | "already_frozen" | "not_found" | "expired" | "forbidden"
