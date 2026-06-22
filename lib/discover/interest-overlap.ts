import type { SwipeProfile } from "@/lib/demo-profiles"
import type { CommonInterest } from "@/lib/interests/types"
import { INTERESTS } from "@/lib/interests"
import type { InterestId } from "@/lib/interests"
import { getUserProfile } from "@/lib/user-profile"

export function computeInterestOverlapForProfile(profile: SwipeProfile): {
  compatibility: number
  commonInterests: CommonInterest[]
} {
  if (profile.compatibility != null && profile.commonInterests?.length) {
    return {
      compatibility: profile.compatibility,
      commonInterests: profile.commonInterests,
    }
  }

  const me = getUserProfile()
  const myIds = me?.interests ?? []
  if (myIds.length === 0) {
    return { compatibility: profile.compatibility ?? 0, commonInterests: profile.commonInterests ?? [] }
  }

  const myLabels = new Set<string>(
    myIds.flatMap((id) => {
      const item = INTERESTS.find((i) => i.id === id)
      return item ? [item.ru, item.uk, item.en] : []
    })
  )

  const commonNames = profile.interests.filter((label) => myLabels.has(label))
  const compatibility = Math.round((commonNames.length / Math.max(myIds.length, 1)) * 100)

  const commonInterests: CommonInterest[] = commonNames.map((name, i) => ({
    id: i,
    name,
    emoji: null,
  }))

  return {
    compatibility: profile.compatibility ?? compatibility,
    commonInterests: profile.commonInterests ?? commonInterests,
  }
}

export function interestIdsFromSlugs(
  slugs: string[],
  catalog: { id: number; slug?: string | null }[]
): number[] {
  const bySlug = new Map(catalog.map((i) => [i.slug, i.id]))
  return slugs
    .map((s) => bySlug.get(s))
    .filter((id): id is number => id != null)
}

export function slugsFromInterestIds(ids: InterestId[]): string[] {
  return ids
}
