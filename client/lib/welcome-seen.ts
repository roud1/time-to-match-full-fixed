const WELCOME_SEEN_KEY = "ttm-welcome-seen"

export function isWelcomeSeen(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(WELCOME_SEEN_KEY) === "1"
}

export function markWelcomeSeen(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(WELCOME_SEEN_KEY, "1")
}
