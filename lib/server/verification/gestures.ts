import type { VerificationGesturePrompt } from "@/lib/verification/types"

export const VERIFICATION_GESTURES: VerificationGesturePrompt[] = [
  {
    gesture: "peace",
    emoji: "✌️",
    instruction: 'Покажи жест «peace» (V-образный знак пальцами) рядом с лицом',
  },
  {
    gesture: "nose_touch",
    emoji: "👃",
    instruction: "Коснись кончиком носа указательным пальцем",
  },
  {
    gesture: "ok_sign",
    emoji: "👌",
    instruction: 'Покажи жест «OK» (кольцо из большого и указательного пальца)',
  },
  {
    gesture: "thumbs_up",
    emoji: "👍",
    instruction: "Подними большой палец вверх рядом с щекой",
  },
  {
    gesture: "open_palm",
    emoji: "🖐️",
    instruction: "Покажи открытую ладонь к камере",
  },
]

const GESTURE_CODES = new Set(VERIFICATION_GESTURES.map((g) => g.gesture))

export function isValidGestureCode(code: string): boolean {
  return GESTURE_CODES.has(code)
}

export function pickRandomGesture(): VerificationGesturePrompt {
  const i = Math.floor(Math.random() * VERIFICATION_GESTURES.length)
  return VERIFICATION_GESTURES[i]!
}

export function getGestureByCode(code: string): VerificationGesturePrompt | null {
  return VERIFICATION_GESTURES.find((g) => g.gesture === code) ?? null
}
