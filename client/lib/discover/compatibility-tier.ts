export type CompatibilityTier = "high" | "mid" | "low"

export function getCompatibilityTier(percent: number): CompatibilityTier {
  if (percent > 70) return "high"
  if (percent >= 40) return "mid"
  return "low"
}
