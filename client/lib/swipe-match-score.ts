import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { computeDiscoverCompatibility } from "@/client/lib/discover-compatibility"

/** Resonance % for UI — smart demo scoring; does not affect `recordSwipe` logic. */
export function demoMatchPercent(profile: SwipeProfile): number {
  return computeDiscoverCompatibility(profile).resonancePercent
}
