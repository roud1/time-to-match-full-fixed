/** Unified motion language — cinematic emotional OS feel (Phase 7–8) */

import { BRAND_MOTION } from "@/lib/brand-tokens"

export const CIN_EASE = BRAND_MOTION.ease

export const springSnappy = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.85 }
export const springSoft = { type: "spring" as const, stiffness: 280, damping: 32, mass: 1 }
export const springDock = { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.9 }
export const springSwipe = { type: "spring" as const, stiffness: 420, damping: 30, mass: 0.95 }

export const fadeUp = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
}

export const screenSlide = {
  initial: { opacity: 0, x: 18, scale: 0.992 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -12, scale: 0.996 },
}

export const tabCrossfade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export const tapScale = { scale: 0.94 }
export const tapScaleSoft = { scale: 0.97 }

export function transitionCinematic(duration = 0.55) {
  return { duration, ease: CIN_EASE }
}
