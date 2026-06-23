import type { TranslationKey } from "@/client/lib/i18n"

export type PlatformPresenceLine = {
  id: string
  textKey: TranslationKey
}

/** Ambient platform-level observation — never a chat prompt. */
export function pickPlatformPresenceLine(): PlatformPresenceLine {
  const hour = new Date().getHours()
  if (hour >= 22 || hour < 5) {
    return { id: "platform-night", textKey: "compPlatformNight" }
  }
  if (hour >= 18) {
    return { id: "platform-evening", textKey: "compPlatformEvening" }
  }
  if (hour >= 6 && hour < 11) {
    return { id: "platform-morning", textKey: "compPlatformMorning" }
  }
  return { id: "platform-day", textKey: "compPlatformDay" }
}
