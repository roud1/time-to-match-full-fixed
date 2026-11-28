const prefix = "ttm-chat-seen:"

/**
 * When each conversation was last opened on this device. Kept in localStorage (it was
 * sessionStorage, so every app restart showed all chats as unread again).
 */
export function getThreadSeenAt(profileId: number): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem(prefix + profileId) ?? sessionStorage.getItem(prefix + profileId)
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

export function markThreadSeen(profileId: number, updatedAt: number) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(prefix + profileId, String(Math.max(updatedAt, getThreadSeenAt(profileId))))
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent("ttm-social-updated"))
}

export function hasUnreadThread(profileId: number, updatedAt: number, lastFromThem: boolean): boolean {
  if (!lastFromThem) return false
  return updatedAt > getThreadSeenAt(profileId)
}

/**
 * Unread = the newest message is from the other person and arrived after the thread was last
 * opened. Uses the server's newest message when it is newer than the messages cached locally.
 */
export function isThreadUnread(thread: {
  profileId: number
  updatedAt: number
  messages: { from: string }[]
  lastFromThem?: boolean
}): boolean {
  const last = thread.messages[thread.messages.length - 1]
  const fromThem = thread.lastFromThem ?? last?.from === "them"
  return hasUnreadThread(thread.profileId, thread.updatedAt, fromThem)
}
