import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import type { MatchDto } from "@/server/matches/types"
import type { ChatMessage, ChatThread } from "@/client/lib/social-store"
import type { ServerMatchMessage } from "@/client/lib/matches/api"

export function serverMessagesToChat(messages: ServerMatchMessage[]): ChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    from: m.isMine ? "me" : "them",
    text: m.body,
    at: new Date(m.createdAt).getTime(),
  }))
}

export function chatThreadUpdatedAt(messages: ChatMessage[]): number {
  if (messages.length === 0) return Date.now()
  return messages[messages.length - 1]?.at ?? Date.now()
}

export function mergeChatThreads(local: ChatThread[], server: ChatThread[]): ChatThread[] {
  const byProfile = new Map<number, ChatThread>()
  for (const th of local) byProfile.set(th.profileId, th)
  for (const th of server) {
    const existing = byProfile.get(th.profileId)
    if (!existing || th.updatedAt >= existing.updatedAt) {
      byProfile.set(th.profileId, th)
    } else if (existing.messages.length === 0 && th.messages.length > 0) {
      byProfile.set(th.profileId, { ...existing, messages: th.messages, updatedAt: th.updatedAt })
    }
  }
  return [...byProfile.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function profileFromServerMatch(match: MatchDto): SwipeProfile {
  const profileId = discoverIdToNumeric(match.peerUserId)
  return {
    id: profileId,
    name: match.peerName?.trim() || "Match",
    age: 25,
    gender: "female",
    location: "—",
    distance: "—",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    timeLeft: "—",
    bio: "",
    interests: [],
    lat: 0,
    lng: 0,
    userId: match.peerUserId,
  }
}

export function threadsFromServerMatches(
  matches: MatchDto[],
  localThreads: ChatThread[]
): ChatThread[] {
  const localByProfile = new Map(localThreads.map((t) => [t.profileId, t]))
  const serverThreads: ChatThread[] = matches.map((m) => {
    const profileId = discoverIdToNumeric(m.peerUserId)
    const cached = localByProfile.get(profileId)
    return {
      profileId,
      messages: cached?.messages ?? [],
      updatedAt: cached?.updatedAt ?? new Date(m.expiresAt).getTime(),
    }
  })
  return mergeChatThreads(localThreads, serverThreads)
}
