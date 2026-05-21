/**
 * Phase 9 — mobile-ready motion presets (re-exports + product timings).
 */
export {
  CIN_EASE,
  springSnappy,
  springSoft,
  springDock,
  springSwipe,
  fadeUp,
  screenSlide,
  tabCrossfade,
  tapScale,
  tapScaleSoft,
} from "@/lib/motion-system"

export const PRODUCT_MOTION = {
  onboardingSlide: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
  emptyReveal: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  matchBurst: { duration: 1.2 },
  liveFeedRotateMs: 5200,
} as const
