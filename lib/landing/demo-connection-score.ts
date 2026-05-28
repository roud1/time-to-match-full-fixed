/** Deterministic demo score from two names (SSR-safe, no random). */
export function demoConnectionScore(nameA: string, nameB: string): number {
  const combined = `${nameA.trim().toLowerCase()}|${nameB.trim().toLowerCase()}`
  if (!combined.replace("|", "").length) return 0

  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) | 0
  }

  return 58 + (Math.abs(hash) % 35)
}
