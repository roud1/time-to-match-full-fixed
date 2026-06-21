export const MATCH_STATUSES = ["new_match", "waiting_reply", "active_chat", "expired"] as const

export type MatchStatus = (typeof MATCH_STATUSES)[number]

export type DbMatchRow = {
  id: string
  user1_id: string
  user2_id: string
  created_at: Date
  expires_at: Date
  status: MatchStatus
  user1_has_sent: boolean
  user2_has_sent: boolean
  expired_at: Date | null
}

export type DbMatchMessageRow = {
  id: string
  match_id: string
  sender_id: string
  body: string
  created_at: Date
}

export type MatchUrgencyLevel = "normal" | "low_visibility" | "warning" | "critical" | "expired"

export type MatchEngineDto = {
  id: string
  peerUserId: string
  peerName: string | null
  createdAt: string
  expiresAt: string
  status: MatchStatus
  isExpired: boolean
  userHasSent: boolean
  peerHasSent: boolean
  priorityLevel?: number
  urgencyLevel?: MatchUrgencyLevel
}

export type MatchDetailDto = MatchEngineDto & {
  messages: Array<{
    id: string
    senderId: string
    body: string
    createdAt: string
    isMine: boolean
  }>
}

export type SendMatchMessageResult =
  | {
      ok: true
      message: { id: string; createdAt: string }
      match: MatchEngineDto
      statusBefore: MatchStatus
      statusAfter: MatchStatus
    }
  | { ok: false; code: "not_found" | "expired" | "forbidden" }

export type ExpireMatchesResult = {
  expiredCount: number
  matchIds: string[]
}
