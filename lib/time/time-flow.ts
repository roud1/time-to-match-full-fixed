import { resolveAtmospherePeriod, type AtmospherePeriod } from "@/lib/world/global-atmosphere"

export type TimeFlowPeriod = AtmospherePeriod

export type TimeFlowTokens = {
  period: TimeFlowPeriod
  hour: number
  glow: number
  motion: number
  gradientDepth: number
  intimacy: number
  transitionPace: number
}

export function getTimeFlowTokens(hour = new Date().getHours()): TimeFlowTokens {
  const period = resolveAtmospherePeriod(hour)

  switch (period) {
    case "night":
      return {
        period,
        hour,
        glow: 0.42,
        motion: 0.72,
        gradientDepth: 0.88,
        intimacy: 0.92,
        transitionPace: 0.85,
      }
    case "evening":
      return {
        period,
        hour,
        glow: 0.78,
        motion: 1.02,
        gradientDepth: 0.72,
        intimacy: 0.8,
        transitionPace: 1,
      }
    case "morning":
      return {
        period,
        hour,
        glow: 0.48,
        motion: 0.82,
        gradientDepth: 0.45,
        intimacy: 0.55,
        transitionPace: 0.9,
      }
    default:
      return {
        period: "day",
        hour,
        glow: 0.55,
        motion: 0.9,
        gradientDepth: 0.5,
        intimacy: 0.5,
        transitionPace: 0.95,
      }
  }
}

export function timeFlowCss(tokens: TimeFlowTokens): Record<string, string> {
  return {
    "--time-glow": String(tokens.glow),
    "--time-motion": String(tokens.motion),
    "--time-depth": String(tokens.gradientDepth),
    "--time-intimacy": String(tokens.intimacy),
    "--time-pace": String(tokens.transitionPace),
  }
}

export function timeFlowAttrs(tokens: TimeFlowTokens): Record<string, string> {
  return {
    "data-time-period": tokens.period,
  }
}
