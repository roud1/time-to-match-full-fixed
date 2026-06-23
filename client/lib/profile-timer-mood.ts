/** Emotional timer copy + visual mood from remaining milliseconds. */

export type TimerMood = "calm" | "waiting" | "fading" | "lastHours" | "almostGone" | "critical"

export type TimerMoodKey =
  | "timerStillWaiting"
  | "timerFadingIn"
  | "timerLastHours"
  | "timerAlmostGone"
  | "timerCritical"

export function parseTimeLeftToMs(timeLeft: string): number {
  const parts = timeLeft.split(":").map((p) => parseInt(p, 10))
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 0
  const [h, m, s] = parts
  return ((h * 3600 + m * 60 + s) * 1000) | 0
}

export function getTimerMoodFromMs(ms: number): TimerMood {
  const hours = ms / (3600 * 1000)
  if (hours <= 0) return "critical"
  if (hours < 6) return "almostGone"
  if (hours < 24) return "lastHours"
  if (hours < 48) return "fading"
  if (hours < 60) return "waiting"
  return "calm"
}

export function getTimerMoodKey(mood: TimerMood): TimerMoodKey {
  switch (mood) {
    case "calm":
    case "waiting":
      return "timerStillWaiting"
    case "fading":
      return "timerFadingIn"
    case "lastHours":
      return "timerLastHours"
    case "almostGone":
      return "timerAlmostGone"
    case "critical":
      return "timerCritical"
  }
}

export function getTimerMoodCardClass(mood: TimerMood): string {
  switch (mood) {
    case "calm":
    case "waiting":
      return ""
    case "fading":
      return "cin-card--fading"
    case "lastHours":
      return "cin-card--fading"
    case "almostGone":
      return "cin-card--urgent"
    case "critical":
      return "cin-card--critical"
  }
}

export function getTimerMoodBadgeClass(mood: TimerMood): string {
  switch (mood) {
    case "calm":
    case "waiting":
      return "cin-timer-mood--calm"
    case "fading":
      return "cin-timer-mood--fading"
    case "lastHours":
      return "cin-timer-mood--fading"
    case "almostGone":
      return "cin-timer-mood--urgent"
    case "critical":
      return "cin-timer-mood--critical"
  }
}

/** Hours rounded up for "Fading in 20h" style copy. */
export function formatTimerHoursCeil(ms: number): number {
  return Math.max(1, Math.ceil(ms / (3600 * 1000)))
}
