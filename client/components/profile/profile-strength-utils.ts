export function strengthHintKey(
  score: number
): "profileStrengthStart" | "profileStrengthGrow" | "profileStrengthGlow" {
  if (score < 40) return "profileStrengthStart"
  if (score < 75) return "profileStrengthGrow"
  return "profileStrengthGlow"
}
