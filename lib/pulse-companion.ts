import type { Locale } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"

/** Reserved profile id — not in swipe deck. */
export const PULSE_PROFILE_ID = 0

/** Portrait used in chat inbox, room header, and profile sheet. */
export const PULSE_AVATAR_SRC = "/images/pulse-avatar.jpg"

export function isPulseProfile(profileId: number): boolean {
  return profileId === PULSE_PROFILE_ID
}

const PULSE_COPY: Record<
  Locale,
  { name: string; age: number; bio: string; interests: string[]; greeting: string }
> = {
  ru: {
    name: "Pulse",
    age: 24,
    bio: "Твоя AI-подруга в Time to Match. Живой разговор про чувства, связи и жизнь — без шаблонов.",
    interests: ["Связь", "Эмоции", "SYNC"],
    greeting:
      "Привет. Я Pulse — рада тебя видеть. Можем поговорить о чём угодно: настроение, матч, SYNC или просто как прошёл день.",
  },
  uk: {
    name: "Pulse",
    age: 24,
    bio: "Твоя AI-подруга в Time to Match. Живий діалог про почуття, зв'язки та життя.",
    interests: ["Зв'язок", "Емоції", "SYNC"],
    greeting:
      "Привіт. Я Pulse — рада тебе бачити. Можемо поговорити про настрій, матч, SYNC або просто як минув день.",
  },
  en: {
    name: "Pulse",
    age: 24,
    bio: "Your AI companion on Time to Match. Real conversation about feelings, connection, and life.",
    interests: ["Connection", "Emotions", "SYNC"],
    greeting:
      "Hi. I'm Pulse — glad you're here. We can talk about mood, a match, SYNC, or just how your day went.",
  },
}

export function getPulseProfile(locale: Locale): SwipeProfile {
  const c = PULSE_COPY[locale]
  return {
    id: PULSE_PROFILE_ID,
    name: c.name,
    age: c.age,
    gender: "female",
    location: "Time to Match",
    distance: "·",
    image: PULSE_AVATAR_SRC,
    images: [PULSE_AVATAR_SRC],
    timeLeft: "∞",
    bio: c.bio,
    interests: c.interests,
    lat: 0,
    lng: 0,
  }
}

export function getPulseGreeting(locale: Locale): string {
  return PULSE_COPY[locale].greeting
}
