"use client"

import {
  DATING_CONNECTION_META,
  DATING_HERO_PROFILE_META,
  type DatingProfileMeta,
} from "@/client/components/landing/dating/dating-demo-profiles"
import { useI18n } from "@/client/lib/i18n"

export type DatingDemoProfile = {
  name: string
  age: number
  distance: string
  connectionScore: number
  imageUrl: string
  verified?: boolean
}

function mapProfile(meta: DatingProfileMeta, t: (key: import("@/client/lib/i18n").TranslationKey) => string): DatingDemoProfile {
  return {
    name: t(meta.nameKey),
    age: meta.age,
    distance: t("datingKmAway").replace("{km}", String(meta.km)),
    connectionScore: meta.connectionScore,
    imageUrl: meta.imageUrl,
    verified: meta.verified,
  }
}

export function useDatingHeroProfiles() {
  const { t } = useI18n()
  return DATING_HERO_PROFILE_META.map((meta) => mapProfile(meta, t))
}

export function useDatingConnectionDemo() {
  const { t } = useI18n()
  return {
    matchName: t(DATING_CONNECTION_META.nameKey),
    connectionScore: DATING_CONNECTION_META.connectionScore,
    imageUrl: DATING_CONNECTION_META.imageUrl,
  }
}
