import type { MessageSentResponse, MatchDto } from "@/server/matches/types"
import { isLocalMatchId, localMatchId } from "@/client/lib/match-freeze-client"
import { recordLocalMessageSent } from "@/client/lib/match-bond-local"
import { resolveMatchIdForProfile } from "@/client/lib/matches/resolve"

export type ReportMessageSentResult =
  | { ok: true; payload: MessageSentResponse; matchId: string }
  | { ok: false; reason: "skipped" | "network" | "not_found" }

export async function reportMessageSent(profileId: number): Promise<ReportMessageSentResult> {
  const matchId = await resolveMatchIdForProfile(profileId)

  if (isLocalMatchId(matchId)) {
    const payload = recordLocalMessageSent(profileId)
    return { ok: true, payload, matchId }
  }

  try {
    const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/message-sent`, {
      method: "POST",
      credentials: "include",
    })
    if (!res.ok) {
      if (res.status === 404 || res.status === 410) {
        const payload = recordLocalMessageSent(profileId)
        return { ok: true, payload, matchId: localMatchId(profileId) }
      }
      return { ok: false, reason: "network" }
    }
    const payload = (await res.json()) as MessageSentResponse
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ttm-bond-updated", { detail: { profileId, payload, matchId } })
      )
      if (payload.prolonged) {
        window.dispatchEvent(new CustomEvent("ttm-connection-updated"))
      }
      if (payload.analysisQueued) {
        window.dispatchEvent(
          new CustomEvent("ttm-analysis-queued", { detail: { matchId, profileId } })
        )
      }
    }
    return { ok: true, payload, matchId }
  } catch {
    const payload = recordLocalMessageSent(profileId)
    return { ok: true, payload, matchId: localMatchId(profileId) }
  }
}

export function patchMatchInCache(
  matches: MatchDto[],
  matchId: string,
  patch: Partial<MatchDto> & { bond?: MatchDto["bond"] }
): MatchDto[] {
  return matches.map((m) => (m.id === matchId ? { ...m, ...patch, bond: patch.bond ?? m.bond } : m))
}

export function bondFromPayload(payload: MessageSentResponse): MatchDto["bond"] {
  return {
    totalMessages: payload.totalMessages,
    prolongCount: payload.prolongCount,
    bondLevel: payload.bondLevel,
    bondProgress: payload.bondProgress,
    messagesUntilNext: payload.messagesUntilNext,
    lastProlongedAt: null,
  }
}
