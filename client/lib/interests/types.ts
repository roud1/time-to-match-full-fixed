export type Interest = {
  id: number
  name: string
  emoji: string | null
  category: string | null
  slug?: string | null
}

export type CommonInterest = {
  id: number
  name: string
  emoji?: string | null
}

export const DATING_PURPOSES = ["serious", "flirt", "friendship", "unknown"] as const
export type DatingPurpose = (typeof DATING_PURPOSES)[number]

export const DEFAULT_MAX_DISTANCE_KM = 50
