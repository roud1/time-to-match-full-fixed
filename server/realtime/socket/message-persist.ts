import { checkAndGrantAchievements } from "@/server/gamification/check"
import {
  ensureEngineMatchForLike,
  findLikeContext,
  sendMatchMessage,
} from "@/server/match-engine/repository"
import type { MessageSentResponse } from "@/server/matches/types"
import { recordMessageSentForMatch } from "@/server/repositories/match-stats"
import { resolveMatchRouteId } from "@/server/matches/resolve-id"
import type { SocketMatchMessage, SocketMessageAck } from "@/server/realtime/socket/types"

const SYSTEM_MSG_RU =
  "💬 Вы хорошо общаетесь — мэтч продлён на 6 часов"

export async function persistMatchMessageViaSocket(input: {
  matchId: string
  senderId: string
  text: string
}): Promise<SocketMessageAck> {
  const resolved = await resolveMatchRouteId(input.matchId, input.senderId)
  if (!resolved) {
    return { ok: false, code: "not_found", message: "Match not found" }
  }

  const likeId = resolved.likeId
  const trimmed = input.text.trim()
  if (!trimmed) {
    return { ok: false, code: "invalid", message: "Empty message" }
  }

  await ensureEngineMatchForLike(likeId, input.senderId)

  const sent = await sendMatchMessage({
    likeId,
    senderId: input.senderId,
    body: trimmed,
  })

  if (!sent.ok) {
    return { ok: false, code: sent.code, message: `Send failed: ${sent.code}` }
  }

  const canonicalId = await findLikeContext(likeId, input.senderId)
  if (canonicalId?.match_id) {
    const { integrateMessageSent } = await import("@/server/engines/integration")
    await integrateMessageSent({
      canonicalMatchId: canonicalId.match_id,
      senderId: input.senderId,
      statusBefore: sent.statusBefore,
      statusAfter: sent.statusAfter,
      messageCreatedAt: new Date(sent.message.createdAt),
    })
  }

  const bondResult = await recordMessageSentForMatch(likeId, input.senderId)
  const bondPayload: MessageSentResponse | undefined =
    bondResult.ok ? bondResult.payload : undefined

  const gamification = await checkAndGrantAchievements(input.senderId, {
    event: "message_sent",
    matchId: likeId,
    messageCount: bondPayload?.totalMessages,
    bondProlonged: bondPayload?.prolonged,
    prolongCount: bondPayload?.prolongCount,
    at: new Date(),
  })

  const message: SocketMatchMessage = {
    id: sent.message.id,
    matchId: likeId,
    senderId: input.senderId,
    body: trimmed,
    createdAt: sent.message.createdAt,
  }

  return {
    ok: true,
    message,
    bond: bondPayload
      ? {
          prolonged: bondPayload.prolonged,
          newExpiresAt: bondPayload.newExpiresAt,
          bondLevel: bondPayload.bondLevel,
          totalMessages: bondPayload.totalMessages,
          bondProgress: bondPayload.bondProgress,
          prolongCount: bondPayload.prolongCount,
          messagesUntilNext: bondPayload.messagesUntilNext,
          addedHours: bondPayload.addedHours,
          systemMessage: bondPayload.prolonged ? SYSTEM_MSG_RU : bondPayload.systemMessage,
        }
      : undefined,
    gamification,
  }
}
