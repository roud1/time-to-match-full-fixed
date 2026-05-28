/**
 * Time to Match — design system (single source of truth)
 * Spacing: strict 8pt scale only.
 */

export const grid = {
  layoutWidth: 1440,
  containerWidth: 1200,
  columns: 12,
  gutter: 24,
  sidePadding: 120,
} as const

export const spacing = {
  1: 4,
  2: 8,
  3: 16,
  4: 24,
  5: 32,
  6: 48,
  7: 64,
  8: 96,
} as const

export type SpacingKey = keyof typeof spacing

export const colors = {
  bg: "#0B0B10",
  surface: "#12121A",
  card: "#161622",
  stroke: "#26263A",
  primary: "#FF3D71",
  secondary: "#7C5CFF",
  text: "#FFFFFF",
  muted: "#A1A1B5",
} as const

export const radius = {
  sm: 12,
  md: 20,
  lg: 24,
  full: 999,
} as const

export const effects = {
  glow: "0 0 40px rgba(255, 61, 113, 0.25)",
} as const

export const motion = {
  durationMin: 250,
  durationMax: 400,
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const

export const breakpoints = {
  mobile: 375,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const

/** Tailwind token prefix: ttm-* */
export const tokens = {
  grid,
  spacing,
  colors,
  radius,
  effects,
  motion,
  breakpoints,
} as const

export default tokens
