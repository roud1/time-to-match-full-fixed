const prefix = "ttm-chat-seen:"

export function getThreadSeenAt(profileId: number): number {
  if (typeof window === "undefined") return 0
  const raw = sessionStorage.getItem(prefix + profileId)
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) ? n : 0
}

export function markThreadSeen(profileId: number, updatedAt: number) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(prefix + profileId, String(Math.max(updatedAt, getThreadSeenAt(profileId))))
  window.dispatchEvent(new CustomEvent("ttm-social-updated"))
}

export function hasUnreadThread(profileId: number, updatedAt: number, lastFromThem: boolean): boolean {
  if (!lastFromThem) return false
  return updatedAt > getThreadSeenAt(profileId)
}
