const KEYS = {
  chatMatchTimer: "ttm-hint-chat-match-timer",
  profileExpiry: "ttm-hint-profile-expiry",
} as const

export type OnboardingHintId = keyof typeof KEYS

function read(key: string): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(key) === "1"
}

function write(key: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, "1")
}

export function isOnboardingHintDismissed(id: OnboardingHintId): boolean {
  return read(KEYS[id])
}

export function dismissOnboardingHint(id: OnboardingHintId): void {
  write(KEYS[id])
}
