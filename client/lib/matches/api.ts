import type { GamificationSnapshot } from "@/server/gamification/types"
import type { MatchStatus } from "@/server/match-engine/types"
import type { MatchBondStats, MessageSentResponse } from "@/server/matches/types"
import { authFetch } from "@/client/lib/auth/fetch"

const REQUEST_TIMEOUT_MS = 15_000

export type ServerMatchMessage = {
  id: string
  senderId: string
  body: string
  createdAt: string
  isMine: boolean
}

export type MatchDetail = {
  id: string
  peerUserId: string
  peerName: string | null
  expiresAt: string
  status: MatchStatus
  isExpired: boolean
  isFrozen?: boolean
  messages: ServerMatchMessage[]
  bond: MatchBondStats
}

export type FetchMatchDetailResult =
  | { ok: true; match: MatchDetail }
  | { ok: false; demoFallback: true }
  | { ok: false; status: number }

export type FetchMatchMessagesResult =
  | { ok: true; messages: ServerMatchMessage[] }
  | { ok: false; demoFallback: true }
  | { ok: false; status: number }

export type SendMatchMessageResult =
  | {
      ok: true
      message: { id: string; createdAt: string }
      match: {
        id: string
        peerUserId: string
        peerName: string | null
        expiresAt: string
        status: MatchStatus
        isExpired: boolean
      }
      statusBefore: MatchStatus
      statusAfter: MatchStatus
      bond?: MessageSentResponse
      systemMessage?: string
      gamification?: GamificationSnapshot
    }
  | { ok: false; demoFallback: true }
  | { ok: false; status: number; error?: string }

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await authFetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

/** GET /api/matches/:id — match detail including messages. */
export async function fetchMatchDetail(matchId: string): Promise<FetchMatchDetailResult> {
  try {
    const res = await fetchWithTimeout(`/api/matches/${encodeURIComponent(matchId)}`, {
      cache: "no-store",
    })
    if (res.status === 503) return { ok: false, demoFallback: true }
    if (!res.ok) return { ok: false, status: res.status }
    const data = (await res.json()) as { match?: MatchDetail }
    if (!data.match) return { ok: false, status: res.status }
    return { ok: true, match: data.match }
  } catch {
    return { ok: false, status: 0 }
  }
}

/** Load chat messages for a match (via match detail). */
export async function fetchMatchMessages(matchId: string): Promise<FetchMatchMessagesResult> {
  const detail = await fetchMatchDetail(matchId)
  if (!detail.ok) return detail
  return { ok: true, messages: detail.match.messages }
}

/** POST /api/matches/:id/message — persist message + engine transition + bond. */
export async function sendMatchMessage(
  matchId: string,
  text: string
): Promise<SendMatchMessageResult> {
  try {
    const res = await fetchWithTimeout(`/api/matches/${encodeURIComponent(matchId)}/message`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (res.status === 503) return { ok: false, demoFallback: true }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, status: res.status, error: body.error }
    }
    return (await res.json()) as SendMatchMessageResult & { ok: true }
  } catch {
    return { ok: false, status: 0 }
  }
}
