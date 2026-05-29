const WELCOME_SEEN_KEY = "ttm-welcome-seen"

export function isWelcomeSeen(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(WELCOME_SEEN_KEY) === "1"
}

export function markWelcomeSeen(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(WELCOME_SEEN_KEY, "1")
}
