const DIGEST_KEY = "ttm-activity-digest-v1"

export type ActivityDigest = {
  likes: number
  chats: number
  matches: number
  savedAt: number
}

export function readActivityDigest(): ActivityDigest | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(DIGEST_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ActivityDigest
  } catch {
    return null
  }
}

export function writeActivityDigest(d: Omit<ActivityDigest, "savedAt">) {
  if (typeof window === "undefined") return
  const payload: ActivityDigest = { ...d, savedAt: Date.now() }
  sessionStorage.setItem(DIGEST_KEY, JSON.stringify(payload))
}

export type ActivityBump =
  | { kind: "likes"; delta: number }
  | { kind: "chats"; delta: number }
  | { kind: "matches"; delta: number }

/** Compare previous snapshot to current counts; returns bumps (delta > 0 only). */
export function diffActivityDigest(prev: ActivityDigest | null, next: { likes: number; chats: number; matches: number }): ActivityBump[] {
  if (!prev) return []
  const bumps: ActivityBump[] = []
  if (next.likes > prev.likes) bumps.push({ kind: "likes", delta: next.likes - prev.likes })
  if (next.chats > prev.chats) bumps.push({ kind: "chats", delta: next.chats - prev.chats })
  if (next.matches > prev.matches) bumps.push({ kind: "matches", delta: next.matches - prev.matches })
  return bumps
}
