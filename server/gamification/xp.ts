/** XP → level: level = floor(sqrt(xp / 100)) + 1 */

export function levelFromXp(xp: number): number {
  if (xp <= 0) return 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpRequiredForLevel(level: number): number {
  const l = Math.max(1, level)
  return (l - 1) ** 2 * 100
}

export function xpProgressInLevel(xp: number) {
  const level = levelFromXp(xp)
  const start = xpRequiredForLevel(level)
  const end = xpRequiredForLevel(level + 1)
  const span = Math.max(1, end - start)
  const current = Math.max(0, xp - start)
  return {
    level,
    xp,
    xpInLevel: current,
    xpForNextLevel: span,
    progress: Math.min(1, current / span),
  }
}
