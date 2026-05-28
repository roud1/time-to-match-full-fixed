import type { TranslationKey } from "@/lib/i18n"

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
]

export const DATING_CONNECTION_META = {
  nameKey: "datingProfileNameEmma" as TranslationKey,
  connectionScore: 87,
  imageUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80",
}
