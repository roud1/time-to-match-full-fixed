import {
  BOND_MESSAGES_PER_PROLONG,
  BOND_PROLONG_COOLDOWN_MS,
  BOND_PROLONG_HOURS,
  messagesUntilNextFromTotal,
} from "@/server/matches/bond-constants"
import type { MessageSentResponse } from "@/server/matches/types"
import { extendConnectionExpiryByHours } from "@/client/lib/connection-store"
import { localMatchId } from "@/client/lib/match-freeze-client"

const KEY_PREFIX = "ttm-local-bond:"

export type LocalBondState = {
  totalMessages: number
  prolongCount: number
  lastProlongedAt: number | null
}

function load(profileId: number): LocalBondState {
  if (typeof window === "undefined") {
    return { totalMessages: 0, prolongCount: 0, lastProlongedAt: null }
  }
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${profileId}`)
    if (!raw) return { totalMessages: 0, prolongCount: 0, lastProlongedAt: null }
    return JSON.parse(raw) as LocalBondState
  } catch {
    return { totalMessages: 0, prolongCount: 0, lastProlongedAt: null }
  }
}

function save(profileId: number, state: LocalBondState) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${KEY_PREFIX}${profileId}`, JSON.stringify(state))
}

function computeBond(totalMessages: number) {
  const bondLevel = Math.floor(totalMessages / BOND_MESSAGES_PER_PROLONG)
  const bondProgress =
    BOND_MESSAGES_PER_PROLONG > 0
      ? (totalMessages % BOND_MESSAGES_PER_PROLONG) / BOND_MESSAGES_PER_PROLONG
      : 0
  return { bondLevel, bondProgress }
}

function canProlong(lastProlongedAt: number | null): boolean {
  if (lastProlongedAt == null) return true
  return Date.now() - lastProlongedAt >= BOND_PROLONG_COOLDOWN_MS
}

export function recordLocalMessageSent(profileId: number): MessageSentResponse {
  const state = load(profileId)
  state.totalMessages += 1

  let prolonged = false
  let newExpiresAt: string | undefined

  if (
    state.totalMessages > 0 &&
    state.totalMessages % BOND_MESSAGES_PER_PROLONG === 0 &&
    canProlong(state.lastProlongedAt)
  ) {
    state.prolongCount += 1
    state.lastProlongedAt = Date.now()
    prolonged = true
    newExpiresAt = extendConnectionExpiryByHours(profileId, BOND_PROLONG_HOURS)
  }

  save(profileId, state)
  const { bondLevel, bondProgress } = computeBond(state.totalMessages)

  const payload: MessageSentResponse = {
    prolonged,
    newExpiresAt,
    bondLevel,
    totalMessages: state.totalMessages,
    bondProgress,
    prolongCount: state.prolongCount,
    messagesUntilNext: prolonged
      ? BOND_MESSAGES_PER_PROLONG
      : messagesUntilNextFromTotal(state.totalMessages),
    addedHours: prolonged ? BOND_PROLONG_HOURS : undefined,
    systemMessage: prolonged
      ? "💬 Вы хорошо общаетесь — мэтч продлён на 6 часов"
      : undefined,
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ttm-bond-updated", { detail: { profileId, payload, matchId: localMatchId(profileId) } })
    )
  }

  return payload
}

export function getLocalBondState(profileId: number): LocalBondState {
  return load(profileId)
}

export function localBondToMatchBond(profileId: number) {
  const s = load(profileId)
  const { bondLevel, bondProgress } = computeBond(s.totalMessages)
  return {
    totalMessages: s.totalMessages,
    prolongCount: s.prolongCount,
    bondLevel,
    bondProgress,
    messagesUntilNext: messagesUntilNextFromTotal(s.totalMessages),
    lastProlongedAt: s.lastProlongedAt ? new Date(s.lastProlongedAt).toISOString() : null,
  }
}
