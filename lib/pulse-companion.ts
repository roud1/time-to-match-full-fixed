import type { Locale } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"

/** Reserved id — not a swipe profile. */
export const PULSE_PROFILE_ID = 0

const PULSE_AVATAR = "/icon.svg"

const COPY: Record<
  Locale,
  { name: string; bio: string; welcome: string }
> = {
  ru: {
    name: "Pulse",
    bio: "AI-гид Time to Match — связи, синхронизация и советы по платформе.",
    welcome:
      "Привет. Я Pulse — голос Time to Match. Расскажу про SYNC, связи и как выжать максимум из чатов. Чем помочь?",
  },
  uk: {
    name: "Pulse",
    bio: "AI-гід Time to Match — зв'язки, синхронізація та поради.",
    welcome:
      "Привіт. Я Pulse — голос Time to Match. Підкажу про SYNC, зв'язки та чати. Чим допомогти?",
  },
  en: {
    name: "Pulse",
    bio: "Time to Match AI guide — sync, bonds, and how to use the platform.",
    welcome:
      "Hi. I'm Pulse — the voice of Time to Match. Ask me about sync, connections, or your next move. What’s on your mind?",
  },
}

export function isPulseProfile(profileId: number): boolean {
  return profileId === PULSE_PROFILE_ID
}

export function getPulseProfile(locale: Locale): SwipeProfile {
  const c = COPY[locale] ?? COPY.en
  return {
    id: PULSE_PROFILE_ID,
    name: c.name,
    age: 0,
    gender: "female",
    location: "Time to Match",
    distance: "",
    image: PULSE_AVATAR,
    images: [PULSE_AVATAR],
    timeLeft: "∞",
    bio: c.bio,
    interests: ["SYNC", "Connections"],
    lat: 0,
    lng: 0,
  }
}

export function getPulseWelcomeMessage(locale: Locale): string {
  return (COPY[locale] ?? COPY.en).welcome
}
