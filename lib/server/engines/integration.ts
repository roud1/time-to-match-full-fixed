import { getMatchById } from "@/lib/server/match-engine/repository"
import type { MatchStatus } from "@/lib/server/match-engine/types"
import { onMessageSent, onMatchCreated, recomputeUserBehavior } from "@/lib/server/engines/behavior/behavior.service"
import {
  onActiveChat,
  onFirstMessage,
} from "@/lib/server/engines/expiration/expiration.service"
import { assignMatchPriority } from "@/lib/server/engines/ranking/ranking.service"

/** Wire engines after canonical match row is created. */
export async function integrateMatchCreated(
  matchId: string,
  userA: string,
  userB: string
): Promise<void> {
  await onMatchCreated(userA, userB, matchId)
  await assignMatchPriority(matchId, userA, userB)
  await Promise.all([recomputeUserBehavior(userA), recomputeUserBehavior(userB)])
}

/** Wire engines after server message + state transition. */
export async function integrateMessageSent(input: {
  canonicalMatchId: string
  senderId: string
  statusBefore: MatchStatus
  statusAfter: MatchStatus
  messageCreatedAt: Date
}): Promise<void> {
  const match = await getMatchById(input.canonicalMatchId)
  if (!match) return

  let responseTimeMs: number | null = null
  const db = (await import("@/lib/server/db")).getDb()
  if (db) {
    const prior = await db<{ created_at: Date }[]>`
      SELECT created_at
      FROM match_messages
      WHERE match_id = ${input.canonicalMatchId}
        AND sender_id <> ${input.senderId}
      ORDER BY created_at DESC
      LIMIT 1
    `
    if (prior[0]) {
      responseTimeMs = input.messageCreatedAt.getTime() - prior[0].created_at.getTime()
    }
  }

  const isFirstInMatch = input.statusBefore === "new_match"

  if (isFirstInMatch) {
    await onFirstMessage({
      matchId: input.canonicalMatchId,
      senderId: input.senderId,
      user1Id: match.user1_id,
      user2Id: match.user2_id,
    })
  }

  if (input.statusAfter === "active_chat") {
    await onActiveChat(input.canonicalMatchId)
  }

  await onMessageSent({
    senderId: input.senderId,
    matchId: input.canonicalMatchId,
    responseTimeMs,
    isFirstInMatch,
  })
}
