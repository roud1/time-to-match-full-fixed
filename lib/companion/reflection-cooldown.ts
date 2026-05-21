const PREFIX = "ttm-companion-reflection"
const COOLDOWN_MS = 4 * 60 * 60 * 1000

export function canShowReflection(profileId: number): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(`${PREFIX}-${profileId}`)
    if (!raw) return true
    return Date.now() - Number(raw) >= COOLDOWN_MS
  } catch {
    return true
  }
}

export function markReflectionShown(profileId: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${PREFIX}-${profileId}`, String(Date.now()))
}
