import type { TranslationKey } from "@/client/lib/i18n"

export type DatingProfileMeta = {
  nameKey: TranslationKey
  age: number
  km: number
  connectionScore: number
  imageUrl: string
  verified?: boolean
}

export const DATING_HERO_PROFILE_META: DatingProfileMeta[] = [
  {
    nameKey: "datingProfileNameEmma",
    age: 24,
    km: 2,
    connectionScore: 87,
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&h=600&fit=crop&q=85",
  },
  {
    nameKey: "datingProfileNameJames",
    age: 27,
    km: 3,
    connectionScore: 82,
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=600&fit=crop&q=85",
  },
  {
    nameKey: "datingProfileNameSofia",
    age: 22,
    km: 1,
    connectionScore: 91,
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=600&fit=crop&q=85",
  },
]

export const DATING_CONNECTION_META = {
  nameKey: "datingProfileNameEmma" as TranslationKey,
  connectionScore: 87,
  imageUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80",
}

/** Phone mockup swipe card — Sofia */
export const DATING_MOCKUP_SWIPE_PHOTO = DATING_HERO_PROFILE_META[2].imageUrl

/** Product preview swipe panel */
export const DATING_PREVIEW_SWIPE_PHOTO =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&h=600&fit=crop&q=85"

export const DATING_PREVIEW_SWIPE_AGE = 27
export const DATING_PREVIEW_SWIPE_KM = 2
