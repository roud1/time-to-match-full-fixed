import type { CommonInterest } from "@/client/lib/interests/types"

export function interestCompatibilityPercent(
  viewerInterestIds: number[],
  candidateInterestIds: number[],
  common: CommonInterest[]
): number {
  const viewerCount = viewerInterestIds.length
  if (viewerCount === 0) return 0
  const overlap = common.length > 0 ? common.length : countOverlap(viewerInterestIds, candidateInterestIds)
  return Math.round((overlap / Math.max(viewerCount, 1)) * 100)
}

function countOverlap(a: number[], b: number[]): number {
  const set = new Set(b)
  return a.filter((id) => set.has(id)).length
}
