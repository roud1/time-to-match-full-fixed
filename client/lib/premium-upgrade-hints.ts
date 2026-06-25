export const PREMIUM_UPGRADE_HINTS = [
  "default",
  "rewind",
  "boost",
  "likes",
  "likedYou",
  "map",
  "timer",
] as const

export type PremiumUpgradeHint = (typeof PREMIUM_UPGRADE_HINTS)[number]
