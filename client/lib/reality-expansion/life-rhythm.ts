import { getLastActiveAt } from "@/client/lib/profile-life-store"
import { computeProfileLife } from "@/client/lib/profile-life"
import { getChats, type ChatMessage } from "@/client/lib/social-store"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"
import type { TranslationKey } from "@/client/lib/i18n"

export type LifeRhythmPhase =
  | "active_surge"
  | "calm_flow"
  | "emotional_silence"
  | "night_intimacy"

export type EmotionalLifeRhythm = {
  phase: LifeRhythmPhase
  activeHourBias: "day" | "evening" | "night" | "mixed"
  nightConnectionWeight: number
  silenceDepth: number
  energyCycle: number
  labelKey: TranslationKey
}

function hourBiasFromMessages(messages: ChatMessage[]): EmotionalLifeRhythm["activeHourBias"] {
  if (messages.length < 2) return "mixed"
  const buckets = { day: 0, evening: 0, night: 0 }
  for (const m of messages) {
    const h = new Date(m.at).getHours()
    if (h >= 22 || h < 5) buckets.night++
    else if (h >= 18) buckets.evening++
    else buckets.day++
  }
  const max = Math.max(buckets.day, buckets.evening, buckets.night)
  if (max === buckets.night) return "night"
  if (max === buckets.evening) return "evening"
  if (max === buckets.day) return "day"
  return "mixed"
}

export function analyzeEmotionalLifeRhythm(options?: {
  locale?: Locale
  position?: GeoPosition | null
  hour?: number
}): EmotionalLifeRhythm {
  const hour = options?.hour ?? new Date().getHours()
  const lastActive = getLastActiveAt()
  const life = computeProfileLife(lastActive)
  const threads =
    options?.locale != null
      ? getChats(options.locale, options.position ?? null)
      : []
  const allMessages = threads.flatMap((t) => t.messages)
  const hourBias = hourBiasFromMessages(allMessages)
  const nightMsgs = allMessages.filter((m) => {
    const h = new Date(m.at).getHours()
    return h >= 22 || h < 5
  }).length
  const nightWeight = allMessages.length > 0 ? nightMsgs / allMessages.length : 0

  let phase: LifeRhythmPhase = "calm_flow"
  let labelKey: TranslationKey = "erRhythmCalm"

  if (life.state === "sleeping" || life.state === "archived") {
    phase = "emotional_silence"
    labelKey = "erRhythmSilence"
  } else if (hour >= 22 || hour < 5 || hourBias === "night") {
    phase = "night_intimacy"
    labelKey = "erRhythmNight"
  } else if (allMessages.length > 4 && life.state === "active") {
    phase = "active_surge"
    labelKey = "erRhythmActive"
  }

  const silenceDepth =
    life.state === "fading" ? 0.35 + life.fadeProgress * 0.4 : life.state === "active" ? 0.1 : 0.55

  return {
    phase,
    activeHourBias: hourBias,
    nightConnectionWeight: nightWeight,
    silenceDepth,
    energyCycle: Math.min(1, life.presenceWeight * 0.7 + (1 - silenceDepth) * 0.3),
    labelKey,
  }
}

export function rhythmCss(r: EmotionalLifeRhythm): Record<string, string> {
  return {
    "--er-rhythm-phase": r.phase,
    "--er-energy-cycle": String(r.energyCycle),
    "--er-night-weight": String(r.nightConnectionWeight),
    "--er-silence-depth": String(r.silenceDepth),
  }
}

export function rhythmAttrs(r: EmotionalLifeRhythm): Record<string, string> {
  return { "data-er-rhythm": r.phase }
}
