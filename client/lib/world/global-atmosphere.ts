/** Phase 12 — platform-wide atmosphere by time of day. */

export type AtmospherePeriod = "night" | "evening" | "day" | "morning"

export type GlobalAtmosphereTokens = {
  period: AtmospherePeriod
  motionScale: number
  glowWarmth: number
  depthLevel: number
  waveSpeed: number
  particleDensity: number
}

export function resolveAtmospherePeriod(hour = new Date().getHours()): AtmospherePeriod {
  if (hour >= 23 || hour < 5) return "night"
  if (hour >= 18) return "evening"
  if (hour >= 11) return "day"
  return "morning"
}

const TOKENS: Record<AtmospherePeriod, Omit<GlobalAtmosphereTokens, "period">> = {
  night: {
    motionScale: 0.72,
    glowWarmth: 0.35,
    depthLevel: 0.9,
    waveSpeed: 0.45,
    particleDensity: 0.25,
  },
  evening: {
    motionScale: 1.05,
    glowWarmth: 0.88,
    depthLevel: 0.75,
    waveSpeed: 0.95,
    particleDensity: 0.55,
  },
  day: {
    motionScale: 0.92,
    glowWarmth: 0.55,
    depthLevel: 0.5,
    waveSpeed: 0.7,
    particleDensity: 0.35,
  },
  morning: {
    motionScale: 0.85,
    glowWarmth: 0.62,
    depthLevel: 0.55,
    waveSpeed: 0.6,
    particleDensity: 0.3,
  },
}

export function getGlobalAtmosphere(hour?: number): GlobalAtmosphereTokens {
  const period = resolveAtmospherePeriod(hour)
  return { period, ...TOKENS[period] }
}

export function atmosphereDataAttrs(tokens: GlobalAtmosphereTokens): Record<string, string> {
  return {
    "data-atmosphere-period": tokens.period,
    "data-atmosphere-motion": String(tokens.motionScale),
  }
}
