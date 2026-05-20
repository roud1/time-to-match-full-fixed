import type { SwipeProfile } from "@/lib/demo-profiles"

/** Deterministic demo “match %” for UI — does not affect `recordSwipe` logic. */
export function demoMatchPercent(profile: SwipeProfile): number {
  const base = 58 + ((profile.id * 17) % 42)
  return Math.min(99, Math.max(61, base))
}
