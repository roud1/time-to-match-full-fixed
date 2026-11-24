/**
 * Blind Date games — catalog (pure data, shared by server and client).
 *
 * A game is a list of rounds. Every round has a kind that defines what each person answers:
 *  - choice      both pick one option; revealed when both answered (This or That, Spark,
 *                Our Perfect Date, Compatibility Challenges)
 *  - predict     both answer about themselves AND guess the other's answer (Mind Reader)
 *  - open        both write a short answer; revealed when both wrote (Without Masks)
 *  - two_truths  the author writes three statements and marks the lie, the other guesses
 *
 * Texts live on the client (client/lib/blind-date-games-text.ts) keyed by the ids below, so the
 * server never stores translated content and new games are added here + in the texts.
 */

export type RoundKind = "choice" | "predict" | "open" | "two_truths"

export type RoundDef = {
  kind: RoundKind
  /** Prompt id (text on the client). */
  prompt: string
  /** Number of options for choice / predict rounds. */
  options: number
  /** two_truths: who writes the statements. */
  author?: "a" | "b"
}

export const GAME_KEYS = [
  "this_or_that",
  "mind_reader",
  "two_truths",
  "without_masks",
  "perfect_date",
  "spark",
  "compat",
] as const
export type GameKey = (typeof GAME_KEYS)[number]

export const THIS_OR_THAT_PROMPTS = ["tot1", "tot2", "tot3", "tot4", "tot5", "tot6", "tot7"] as const
export const SPARK_PROMPTS = ["sp1", "sp2", "sp3", "sp4", "sp5", "sp6", "sp7"] as const
export const MIND_READER_PROMPTS = ["mr1", "mr2", "mr3", "mr4", "mr5"] as const
export const WITHOUT_MASKS_PROMPTS = ["wm1", "wm2", "wm3", "wm4", "wm5", "wm6"] as const
export const PERFECT_DATE_PROMPTS = ["pd1", "pd2", "pd3", "pd4"] as const

export const COMPAT_CATEGORIES = {
  values: ["cv1", "cv2", "cv3"],
  lifestyle: ["cl1", "cl2", "cl3"],
  communication: ["cc1", "cc2", "cc3"],
  future: ["cf1", "cf2", "cf3"],
} as const
export type CompatCategory = keyof typeof COMPAT_CATEGORIES
export const COMPAT_CATEGORY_KEYS = Object.keys(COMPAT_CATEGORIES) as CompatCategory[]

/** Every prompt id with its option count (0 = free text). */
export const PROMPT_OPTIONS: Record<string, number> = {
  ...Object.fromEntries(THIS_OR_THAT_PROMPTS.map((p) => [p, 2])),
  ...Object.fromEntries(SPARK_PROMPTS.map((p) => [p, 2])),
  ...Object.fromEntries(MIND_READER_PROMPTS.map((p) => [p, 3])),
  ...Object.fromEntries(WITHOUT_MASKS_PROMPTS.map((p) => [p, 0])),
  ...Object.fromEntries(PERFECT_DATE_PROMPTS.map((p) => [p, 4])),
  ...Object.fromEntries(Object.values(COMPAT_CATEGORIES).flat().map((p) => [p, 3])),
  tt: 3,
}

export type GameDef = {
  key: GameKey
  /** Seconds per round (Spark); undefined = no limit. */
  roundSeconds?: number
  /** Premium hook: extra game packs. No game is premium today. */
  premium?: boolean
  build: (opts: { category?: CompatCategory; random: () => number }) => RoundDef[]
}

function pick<T>(list: readonly T[], n: number, random: () => number): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

const choice = (prompt: string): RoundDef => ({ kind: "choice", prompt, options: PROMPT_OPTIONS[prompt] })

export const GAMES: Record<GameKey, GameDef> = {
  this_or_that: {
    key: "this_or_that",
    build: ({ random }) => pick(THIS_OR_THAT_PROMPTS, 5, random).map(choice),
  },
  mind_reader: {
    key: "mind_reader",
    build: ({ random }) =>
      pick(MIND_READER_PROMPTS, 3, random).map((prompt) => ({ kind: "predict", prompt, options: 3 })),
  },
  two_truths: {
    key: "two_truths",
    build: () => [
      { kind: "two_truths", prompt: "tt", options: 3, author: "a" },
      { kind: "two_truths", prompt: "tt", options: 3, author: "b" },
    ],
  },
  without_masks: {
    key: "without_masks",
    build: ({ random }) =>
      pick(WITHOUT_MASKS_PROMPTS, 2, random).map((prompt) => ({ kind: "open", prompt, options: 0 })),
  },
  perfect_date: {
    key: "perfect_date",
    build: () => PERFECT_DATE_PROMPTS.map(choice),
  },
  spark: {
    key: "spark",
    roundSeconds: 15,
    build: ({ random }) => pick(SPARK_PROMPTS, 5, random).map(choice),
  },
  compat: {
    key: "compat",
    build: ({ category }) => COMPAT_CATEGORIES[category ?? "values"].map(choice),
  },
}

export function isGameKey(v: unknown): v is GameKey {
  return typeof v === "string" && (GAME_KEYS as readonly string[]).includes(v)
}

export function isCompatCategory(v: unknown): v is CompatCategory {
  return typeof v === "string" && v in COMPAT_CATEGORIES
}
