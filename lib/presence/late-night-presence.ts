import type { TranslationKey } from "@/lib/i18n"

export type LateNightPresence = {
  active: boolean
  depth: number
  intimacy: number
  motion: number
  labelKey: TranslationKey
}

export function resolveLateNightPresence(hour = new Date().getHours()): LateNightPresence {
  const active = hour >= 22 || hour < 5

  return {
    active,
    depth: active ? 0.92 : 0.35,
    intimacy: active ? 0.88 : 0.4,
    motion: active ? 0.78 : 1,
    labelKey: active ? "presLateNightActive" : "presLateNightOff",
  }
}

export function lateNightCss(late: LateNightPresence): Record<string, string> {
  if (!late.active) return {}
  return {
    "--pres-night-depth": String(late.depth),
    "--pres-night-intimacy": String(late.intimacy),
    "--pres-night-motion": String(late.motion),
  }
}

export function lateNightAttrs(late: LateNightPresence): Record<string, string> {
  return late.active ? { "data-pres-late-night": "true" } : {}
}
