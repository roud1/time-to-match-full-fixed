import type { GamificationSnapshot } from "@/lib/server/gamification/types"

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
}

export type FreezeMatchResponse = {
  match: MatchDto
  gamification?: GamificationSnapshot
}

export type FreezeMatchErrorCode = "freeze_cooldown" | "already_frozen" | "not_found" | "expired" | "forbidden"
