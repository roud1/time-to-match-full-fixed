import {
  activityLevelFromSignals,
  extractAIConnectionSignals,
} from "@/client/lib/ai-connection-engine"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"
import type { AnalyzeConnectionBody } from "@/server/validation/connection-ai"

export type ServerMatchMessage = {
  senderId: string
  body: string
  createdAt: string
  isMine: boolean
}

function replyTimes(messages: ChatMessage[]): number[] {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const times: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].from !== sorted[i].from) {
      times.push(sorted[i].at - sorted[i - 1].at)
    }
  }
  return times
}

function buildConnectionRecord(
  profileId: number,
  messages: ChatMessage[],
  matchedAt: number,
  expiresAt: number
): ConnectionRecord {
  const myMessages = messages.filter((m) => m.from === "me").length
  const theirMessages = messages.filter((m) => m.from === "them").length
  const lastAt = messages[messages.length - 1]?.at ?? matchedAt

  return {
    profileId,
    matchedAt,
    expiresAt,
    stage: messages.length >= 20 ? "strong" : messages.length >= 8 ? "active" : "spark",
    status: "alive",
    streakDays: 0,
    streakScore: 0,
    lastInteractionAt: lastAt,
    totalExtensionsMs: 0,
    messagesExchanged: messages.length,
    myMessages,
    theirMessages,
    bothParticipated: myMessages > 0 && theirMessages > 0,
  }
}

export function serverMessagesToChat(messages: ServerMatchMessage[]): ChatMessage[] {
  return messages.map((m) => ({
    id: `${m.createdAt}:${m.senderId}`,
    from: m.isMine ? ("me" as const) : ("them" as const),
    text: m.body,
    at: new Date(m.createdAt).getTime(),
  }))
}

export function buildAnalyzeRequestFromServerMessages(input: {
  peerUserId: string
  locale: string
  messages: ServerMatchMessage[]
  matchedAt: Date
  expiresAt: Date | null
}): AnalyzeConnectionBody | null {
  const chat = serverMessagesToChat(input.messages)
  if (chat.length === 0) return null

  const profileId = discoverIdToNumeric(input.peerUserId)
  const matchedAt = input.matchedAt.getTime()
  const expiresAt = input.expiresAt?.getTime() ?? matchedAt + 24 * 60 * 60 * 1000
  const record = buildConnectionRecord(profileId, chat, matchedAt, expiresAt)
  const signals = extractAIConnectionSignals(chat, record)

  return {
    profileId,
    locale: (input.locale === "en" ||
    input.locale === "ru" ||
    input.locale === "uk" ||
    input.locale === "de" ||
    input.locale === "es" ||
    input.locale === "pl" ||
    input.locale === "fr" ||
    input.locale === "it" ||
    input.locale === "tr"
      ? input.locale
      : "ru") as AnalyzeConnectionBody["locale"],
    messages: chat.slice(-30).map((m) => ({
      from: m.from === "system" ? "me" : m.from,
      text: m.text,
      at: m.at,
    })),
    responseTimes: replyTimes(chat),
    activityLevel: activityLevelFromSignals(signals),
    conversationLength: chat.length,
    mutualInteraction: record.bothParticipated,
    lateNightActivity: signals.lateNightRatio >= 0.2 && signals.messageCount >= 3,
    stage: record.stage,
    streakDays: record.streakDays,
    signals,
  }
}
