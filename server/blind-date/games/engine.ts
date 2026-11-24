/**
 * Blind Date game engine — pure state machine (no I/O).
 *
 * Rounds are played in order and synchronously: the next round starts only when both people
 * answered (or the round was skipped / timed out). A person's answer for the current round is
 * never part of the other person's view until the round is complete.
 */

import { checkMessage } from "@/server/blind-date/rules"
import type { GameKey, RoundDef } from "@/server/blind-date/games/catalog"

export type Side = "a" | "b"

export type Answer = {
  choice?: number
  guess?: number
  text?: string
  statements?: string[]
  lie?: number
}

export type RoundRecord = { a?: Answer; b?: Answer; skipped?: boolean }

export type GameState = {
  rounds: RoundDef[]
  current: number
  roundStartedAt: string
  roundSeconds?: number
  category?: string
  records: RoundRecord[]
}

export type GameResult = {
  /** Rounds both answered. */
  answered: number
  /** Rounds that can be compared (choice / predict / two_truths). */
  comparable: number
  /** Comparable rounds that matched (same choice, correct guess). */
  matches: number
}

export type EngineError =
  | "wrong_round"
  | "already_answered"
  | "invalid_answer"
  | "not_your_turn"
  | "contact_details"
  | "too_long"
  | "empty"

const STATEMENT_MAX = 160

export function newGameState(rounds: RoundDef[], now: Date, opts: { roundSeconds?: number; category?: string } = {}): GameState {
  return {
    rounds,
    current: 0,
    roundStartedAt: now.toISOString(),
    roundSeconds: opts.roundSeconds,
    category: opts.category,
    records: rounds.map(() => ({})),
  }
}

export function isFinished(state: GameState): boolean {
  return state.current >= state.rounds.length
}

const other = (s: Side): Side => (s === "a" ? "b" : "a")
const isIndex = (v: unknown, n: number) => Number.isInteger(v) && (v as number) >= 0 && (v as number) < n

function roundComplete(round: RoundDef, rec: RoundRecord): boolean {
  if (rec.skipped) return true
  if (round.kind === "two_truths") {
    const author = round.author ?? "a"
    return Boolean(rec[author]?.statements) && rec[other(author)]?.guess !== undefined
  }
  return Boolean(rec.a && rec.b)
}

function advance(state: GameState, now: Date): GameState {
  let current = state.current
  while (current < state.rounds.length && roundComplete(state.rounds[current], state.records[current])) current++
  if (current === state.current) return state
  return { ...state, current, roundStartedAt: now.toISOString() }
}

/** Validates and normalizes one answer. */
function validate(round: RoundDef, side: Side, rec: RoundRecord, raw: Answer): { ok: true; answer: Answer } | { ok: false; code: EngineError } {
  switch (round.kind) {
    case "choice":
      return isIndex(raw.choice, round.options) ? { ok: true, answer: { choice: raw.choice } } : { ok: false, code: "invalid_answer" }
    case "predict":
      return isIndex(raw.choice, round.options) && isIndex(raw.guess, round.options)
        ? { ok: true, answer: { choice: raw.choice, guess: raw.guess } }
        : { ok: false, code: "invalid_answer" }
    case "open": {
      if (typeof raw.text !== "string") return { ok: false, code: "invalid_answer" }
      const c = checkMessage(raw.text)
      return c.ok ? { ok: true, answer: { text: c.body } } : { ok: false, code: c.code }
    }
    case "two_truths": {
      const author = round.author ?? "a"
      if (side === author) {
        if (!Array.isArray(raw.statements) || raw.statements.length !== 3 || !isIndex(raw.lie, 3)) {
          return { ok: false, code: "invalid_answer" }
        }
        const statements: string[] = []
        for (const s of raw.statements) {
          if (typeof s !== "string") return { ok: false, code: "invalid_answer" }
          const c = checkMessage(s)
          if (!c.ok) return { ok: false, code: c.code }
          if (c.body.length > STATEMENT_MAX) return { ok: false, code: "too_long" }
          statements.push(c.body)
        }
        return { ok: true, answer: { statements, lie: raw.lie } }
      }
      // The guesser can only guess once the statements exist.
      if (!rec[author]?.statements) return { ok: false, code: "not_your_turn" }
      return isIndex(raw.guess, 3) ? { ok: true, answer: { guess: raw.guess } } : { ok: false, code: "invalid_answer" }
    }
  }
}

export function applyAnswer(
  state: GameState,
  side: Side,
  roundIndex: number,
  raw: Answer,
  now: Date
): { ok: true; state: GameState } | { ok: false; code: EngineError } {
  if (roundIndex !== state.current || isFinished(state)) return { ok: false, code: "wrong_round" }
  const round = state.rounds[roundIndex]
  const rec = state.records[roundIndex]
  if (rec[side]) return { ok: false, code: "already_answered" }
  const v = validate(round, side, rec, raw ?? {})
  if (!v.ok) return v
  const records = state.records.map((r, i) => (i === roundIndex ? { ...r, [side]: v.answer } : r))
  return { ok: true, state: advance({ ...state, records }, now) }
}

/** Either person may skip the current question (both move on). */
export function skipRound(state: GameState, roundIndex: number, now: Date): { ok: true; state: GameState } | { ok: false; code: EngineError } {
  if (roundIndex !== state.current || isFinished(state)) return { ok: false, code: "wrong_round" }
  const records = state.records.map((r, i) => (i === roundIndex ? { ...r, skipped: true } : r))
  return { ok: true, state: advance({ ...state, records }, now) }
}

/** Timed rounds (Spark): a round that ran out is skipped. Returns the same object if nothing changed. */
export function tick(state: GameState, now: Date): GameState {
  if (!state.roundSeconds || isFinished(state)) return state
  let s = state
  // Loop in case the game was left alone for several rounds.
  while (!isFinished(s) && now.getTime() >= Date.parse(s.roundStartedAt) + s.roundSeconds! * 1000) {
    const startedAt = new Date(Date.parse(s.roundStartedAt) + s.roundSeconds! * 1000)
    const r = skipRound(s, s.current, startedAt)
    if (!r.ok) break
    s = r.state
  }
  return s
}

function roundMatched(round: RoundDef, rec: RoundRecord): { comparable: number; matches: number } {
  // Only rounds both people actually played count (not skipped, not unfinished).
  if (rec.skipped || !roundComplete(round, rec)) return { comparable: 0, matches: 0 }
  switch (round.kind) {
    case "choice":
      return { comparable: 1, matches: rec.a?.choice === rec.b?.choice ? 1 : 0 }
    case "predict":
      // Two guesses per round: each person guessing the other.
      return {
        comparable: 2,
        matches: (rec.a?.guess === rec.b?.choice ? 1 : 0) + (rec.b?.guess === rec.a?.choice ? 1 : 0),
      }
    case "two_truths": {
      const author = round.author ?? "a"
      return { comparable: 1, matches: rec[other(author)]?.guess === rec[author]?.lie ? 1 : 0 }
    }
    default:
      return { comparable: 0, matches: 0 }
  }
}

export function summarize(state: GameState): GameResult {
  let answered = 0
  let comparable = 0
  let matches = 0
  state.rounds.forEach((round, i) => {
    const rec = state.records[i]
    if (!rec.skipped && roundComplete(round, rec)) answered++
    const m = roundMatched(round, rec)
    comparable += m.comparable
    matches += m.matches
  })
  return { answered, comparable, matches }
}

// ───────────────────────── what one person may see ─────────────────────────

export type RoundView = {
  index: number
  kind: RoundDef["kind"]
  prompt: string
  options: number
  author: "me" | "peer" | null
  skipped: boolean
  mine: Answer | null
  /** Only for finished rounds. */
  theirs: Answer | null
  /** two_truths, current round, I'm the guesser: the statements without the lie. */
  statements: string[] | null
  matched: boolean | null
}

export type GameView = {
  id: string
  key: GameKey
  category: string | null
  status: "active" | "completed" | "abandoned"
  current: number
  total: number
  /** Deadline of the current round (timed games). */
  roundEndsAt: string | null
  /** Current round (null when finished). */
  round: (RoundView & { peerAnswered: boolean }) | null
  /** Finished rounds, newest last. */
  history: RoundView[]
  result: GameResult | null
}

export function viewFor(
  session: { id: string; key: GameKey; status: GameView["status"]; state: GameState; result: GameResult | null },
  me: Side
): GameView {
  const { state } = session
  const peer = other(me)
  const authorOf = (r: RoundDef): RoundView["author"] =>
    r.kind === "two_truths" ? ((r.author ?? "a") === me ? "me" : "peer") : null

  const history: RoundView[] = []
  for (let i = 0; i < Math.min(state.current, state.rounds.length); i++) {
    const r = state.rounds[i]
    const rec = state.records[i]
    const m = roundMatched(r, rec)
    history.push({
      index: i,
      kind: r.kind,
      prompt: r.prompt,
      options: r.options,
      author: authorOf(r),
      skipped: Boolean(rec.skipped),
      mine: rec[me] ?? null,
      theirs: rec[peer] ?? null,
      statements: null,
      matched: m.comparable === 0 ? null : r.kind === "predict" ? rec[me]?.guess === rec[peer]?.choice : m.matches > 0,
    })
  }

  let round: GameView["round"] = null
  if (session.status === "active" && !isFinished(state)) {
    const r = state.rounds[state.current]
    const rec = state.records[state.current]
    const author = authorOf(r)
    const peerAnswer = rec[peer]
    round = {
      index: state.current,
      kind: r.kind,
      prompt: r.prompt,
      options: r.options,
      author,
      skipped: false,
      mine: rec[me] ?? null,
      theirs: null,
      // The guesser sees the three statements, never which one is the lie.
      statements: r.kind === "two_truths" && author === "peer" && peerAnswer?.statements ? peerAnswer.statements : null,
      matched: null,
      peerAnswered: Boolean(peerAnswer),
    }
  }

  return {
    id: session.id,
    key: session.key,
    category: state.category ?? null,
    status: session.status,
    current: state.current,
    total: state.rounds.length,
    roundEndsAt:
      state.roundSeconds && round ? new Date(Date.parse(state.roundStartedAt) + state.roundSeconds * 1000).toISOString() : null,
    round,
    history,
    result: session.result,
  }
}
