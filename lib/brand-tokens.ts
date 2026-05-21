/**
 * Brand tokens for JS/TS (CSS vars are source of truth in app/brand-system.css)
 */

export const BRAND_COLORS = {
  void: "#030304",
  deep: "#050506",
  graphite: "#0c0c0e",
  surface: "#111114",
  accent: "#c8d2ff",
} as const

export const BRAND_GLOW = {
  sync: "rgba(160, 175, 255, 0.42)",
  chemistry: "rgba(168, 130, 255, 0.4)",
  bond: "rgba(140, 200, 180, 0.32)",
  aura: "rgba(200, 195, 255, 0.2)",
  cinematic: "rgba(220, 225, 255, 0.14)",
} as const

export const BRAND_EMOTIONAL_STATE = {
  curious: "rgba(160, 180, 220, 0.35)",
  warm: "rgba(220, 180, 140, 0.38)",
  electric: "rgba(200, 170, 255, 0.42)",
  aligned: "rgba(180, 200, 255, 0.45)",
  distant: "rgba(120, 130, 160, 0.28)",
  fading: "rgba(160, 130, 100, 0.3)",
} as const

export const BRAND_MOTION = {
  ease: [0.22, 1, 0.36, 1] as const,
  durationFast: 0.2,
  duration: 0.38,
  durationSlow: 0.65,
  breathe: 4.5,
} as const

export const BRAND_RADIUS = {
  sm: "0.625rem",
  md: "0.875rem",
  lg: "1.25rem",
  xl: "1.5rem",
  "2xl": "1.75rem",
  pill: "9999px",
} as const
