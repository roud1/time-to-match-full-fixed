/**
 * Blind Date — pure rules (no I/O). Shared by the service, the API and tests.
 */

/** Length of the date itself. */
export const ROOM_DURATION_MS = 10 * 60 * 1000
/** After the date: time each person has to choose Continue / Pass. */
export const DECISION_WINDOW_MS = 2 * 60 * 1000
/** A queue entry is considered gone if the client stopped polling for this long. */
export const QUEUE_STALE_MS = 45 * 1000
/** Pairs that already had a date are not matched again for this long. */
export const REMATCH_COOLDOWN_DAYS = 30
/** Free blind dates per day (Premium hook: more or unlimited). */
export const DEFAULT_FREE_DAILY_DATES = 10

export const REVEAL_STAGES = [0, 25, 50, 75, 100] as const
export type RevealStage = (typeof REVEAL_STAGES)[number]

export type RoomStatus = "active" | "deciding" | "closed"
export type Decision = "continue" | "pass"
export type CloseReason = "matched" | "no_match" | "timeout" | "left" | "reported"

export const MESSAGE_MAX_LENGTH = 500
export const MESSAGES_PER_MINUTE = 15

export function freeDailyDates(): number {
  const n = Number(process.env.BLIND_DATE_FREE_DAILY)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_FREE_DAILY_DATES
}

/** The phase a room should be in at `now`, from its timestamps (closed rooms stay closed). */
export function phaseAt(
  room: { status: RoomStatus; ends_at: Date; decide_until: Date },
  now: Date
): RoomStatus {
  if (room.status === "closed") return "closed"
  if (now >= room.decide_until) return "closed"
  if (now >= room.ends_at) return "deciding"
  return "active"
}

/**
 * Getting-to-know-each-other progress, 0–100. Grows only with MUTUAL participation:
 * the smaller of the two message counts (capped) and completed shared games.
 */
export function connectionProgress(input: {
  messagesA: number
  messagesB: number
  gamesCompleted: number
}): number {
  // Chat alone can reach 75 % (15 messages from each person); the last stage needs a shared game.
  const mutualMessages = Math.min(input.messagesA, input.messagesB, 15)
  const fromMessages = mutualMessages * 5 // up to 75
  const fromGames = Math.min(input.gamesCompleted, 2) * 15 // up to 30
  return Math.max(0, Math.min(100, fromMessages + fromGames))
}

/** Highest reveal stage unlocked by the progress. */
export function stageForProgress(progress: number): RevealStage {
  let stage: RevealStage = 0
  for (const s of REVEAL_STAGES) if (progress >= s) stage = s
  return stage
}

/**
 * What each person may see of the other: nothing until BOTH consented; then the stage the
 * shared progress unlocked. Withdrawing consent hides the photos again.
 */
export function visibleRevealStage(input: {
  consentA: boolean
  consentB: boolean
  progress: number
}): RevealStage {
  if (!input.consentA || !input.consentB) return 0
  return stageForProgress(input.progress)
}

/** Outcome once both decided (or the window ran out). */
export function outcomeFor(decisionA: Decision | null, decisionB: Decision | null): CloseReason {
  if (decisionA === "continue" && decisionB === "continue") return "matched"
  if (decisionA === null || decisionB === null) return decisionA === "pass" || decisionB === "pass" ? "no_match" : "timeout"
  return "no_match"
}

const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|me|ru|ua|de|app|link|ly)\b/i
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/
const PHONE_RE = /(?:\+?\d[\s().-]?){8,}/
const HANDLE_RE = /(?:^|\s)@[a-z0-9_.]{3,}|\b(?:telegram|whats\s?app|instagram|insta|snap(?:chat)?|viber|signal|tg)\b/i

export type MessageCheck =
  | { ok: true; body: string }
  | { ok: false; code: "empty" | "too_long" | "contact_details" }

/**
 * Blind dates are anonymous: links, e-mails, phone numbers and messenger handles are not
 * allowed before a match (protects against spam, scams and sharing identity too early).
 */
export function checkMessage(raw: string): MessageCheck {
  const body = raw.replace(/\s+/g, " ").trim()
  if (!body) return { ok: false, code: "empty" }
  if (body.length > MESSAGE_MAX_LENGTH) return { ok: false, code: "too_long" }
  if (URL_RE.test(body) || EMAIL_RE.test(body) || PHONE_RE.test(body) || HANDLE_RE.test(body)) {
    return { ok: false, code: "contact_details" }
  }
  return { ok: true, body }
}

/** Age in full years at `now` from a YYYY-MM-DD date. */
export function ageFrom(birthDate: Date | string | null | undefined, now = new Date()): number | null {
  if (!birthDate) return null
  const d = typeof birthDate === "string" ? new Date(`${birthDate.slice(0, 10)}T00:00:00Z`) : birthDate
  if (Number.isNaN(d.getTime())) return null
  let age = now.getUTCFullYear() - d.getUTCFullYear()
  const m = now.getUTCMonth() - d.getUTCMonth()
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--
  return age
}

/** First name only — the room never shows the full name. */
export function firstName(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? ""
  return first.slice(0, 40) || "?"
}
