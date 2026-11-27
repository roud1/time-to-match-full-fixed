import { authFetch } from "@/client/lib/auth/fetch"
import type { GameKey } from "@/server/blind-date/games/catalog"
import type { Answer, GameResult, GameView } from "@/server/blind-date/games/engine"

export type { Answer as GameAnswer, GameResult, GameView }
export type { ConnectionReport } from "@/server/blind-date/report"
import type { ConnectionReport } from "@/server/blind-date/report"

export type BlindDecision = "continue" | "pass"
export type BlindPhase = "active" | "deciding" | "closed"
export type BlindCloseReason = "matched" | "no_match" | "timeout" | "left" | "reported"
export type BlindIneligible = "not_found" | "blocked_account" | "age_unknown" | "under_18" | "consent_required" | "daily_limit"

export type BlindState = {
  state: "idle" | "searching" | "in_room"
  roomId?: string
  since?: string
  eligible: boolean
  reason: BlindIneligible | null
  freeDailyDates: number
}

export type BlindRoom = {
  id: string
  version: number
  phase: BlindPhase
  serverNow: string
  startedAt: string
  endsAt: string
  decideUntil: string
  progress: number
  revealStage: 0 | 25 | 50 | 75 | 100
  unlockedStage: 0 | 25 | 50 | 75 | 100
  me: { revealConsent: boolean; decision: BlindDecision | null }
  peer: {
    name: string
    age: number | null
    commonInterests: string[]
    revealConsent: boolean
    decided: boolean
    decision: BlindDecision | null
  }
  messages: { id: string; mine: boolean; body: string; at: string }[]
  game: GameView | null
  gamesPlayed: { key: GameKey; category: string | null; result: GameResult | null }[]
  outcome: null | { reason: BlindCloseReason; matchId: string | null; leftByMe: boolean }
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }

async function call<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await authFetch(url, {
      cache: "no-store",
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    })
    const body = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) return { ok: false, status: res.status, error: body.error ?? "error" }
    return { ok: true, data: body }
  } catch {
    return { ok: false, status: 0, error: "network" }
  }
}

const post = (body?: unknown): RequestInit => ({ method: "POST", body: body === undefined ? undefined : JSON.stringify(body) })

export const blindDateApi = {
  state: () => call<BlindState>("/api/blind-date/state"),
  join: (lang: string, languages: string[]) =>
    call<{ state: "matched"; roomId: string } | { state: "searching"; since: string; waitingNow: number }>(
      "/api/blind-date/queue",
      post({ lang, languages })
    ),
  cancel: () => call<{ state: "idle" }>("/api/blind-date/queue", { method: "DELETE" }),
  room: (id: string, since?: number) =>
    call<BlindRoom | { unchanged: true; version: number; serverNow: string }>(
      `/api/blind-date/rooms/${id}${since ? `?since=${since}` : ""}`
    ),
  send: (id: string, body: string) => call<BlindRoom>(`/api/blind-date/rooms/${id}/messages`, post({ body })),
  reveal: (id: string, consent: boolean) => call<BlindRoom>(`/api/blind-date/rooms/${id}/reveal`, post({ consent })),
  decide: (id: string, decision: BlindDecision) => call<BlindRoom>(`/api/blind-date/rooms/${id}/decision`, post({ decision })),
  leave: (id: string) => call<BlindRoom>(`/api/blind-date/rooms/${id}/leave`, post()),
  report: (id: string, reason: string, block: boolean, comment?: string) =>
    call<{ ok: true }>(`/api/blind-date/rooms/${id}/report`, post({ reason, block, comment })),
  startGame: (id: string, game: GameKey, category?: string) =>
    call<BlindRoom>(`/api/blind-date/rooms/${id}/games`, post({ game, category })),
  answer: (id: string, sessionId: string, round: number, answer: Answer) =>
    call<BlindRoom>(`/api/blind-date/rooms/${id}/games/answer`, post({ sessionId, round, answer })),
  skipRound: (id: string, sessionId: string, round: number) =>
    call<BlindRoom>(`/api/blind-date/rooms/${id}/games/skip`, post({ sessionId, round })),
  endGame: (id: string, sessionId: string) => call<BlindRoom>(`/api/blind-date/rooms/${id}/games/end`, post({ sessionId })),
  insights: (id: string, lang: string) => call<ConnectionReport>(`/api/blind-date/rooms/${id}/insights?lang=${lang}`),
  photoUrl: (id: string, stage: number) => `/api/blind-date/rooms/${id}/photo?stage=${stage}`,
}
