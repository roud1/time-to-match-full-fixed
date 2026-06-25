/** Emotional / reality-expansion UI layer — off by default in production builds. */
export function isEmotionalOsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TTM_EMOTIONAL_OS === "1"
}
