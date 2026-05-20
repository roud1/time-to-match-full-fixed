import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import { getChats, getUnreadLikesCount, getSocialState } from "@/lib/social-store"

export function countUnreadChatThreads(locale: Locale, position: GeoPosition | null): number {
  return getChats(locale, position).filter((th) => {
    const last = th.messages[th.messages.length - 1]
    return hasUnreadThread(th.profileId, th.updatedAt, last?.from === "them")
  }).length
}

export function getActivityCounts(locale: Locale, position: GeoPosition | null) {
  const state = getSocialState(locale, position)
  return {
    likesUnread: getUnreadLikesCount(locale, position),
    chatsUnread: countUnreadChatThreads(locale, position),
    matchCount: state.matches.length,
    chatThreadCount: state.chats.length,
  }
}
