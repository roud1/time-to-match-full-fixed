import type { Locale } from "@/lib/i18n"
import { buildDemoSwipeProfiles, type SwipeProfile } from "@/lib/demo-profiles"
import { filterProfilesForUser } from "@/lib/swipe-gender-filter"
import type { GeoPosition } from "@/lib/geo"
import { getUserProfile } from "@/lib/user-profile"
import { recordProfileActivity } from "@/lib/profile-life-store"
import {
  ensureConnectionForMatch,
  migrateConnectionsFromMatches,
  recordConnectionMessage,
  setMemoryProfileName,
} from "@/lib/connection-store"
import { emitActivityBump } from "@/lib/activity-notify"
import { broadcastPresenceUpdate } from "@/lib/presence/realtime-presence"
import { getPulseProfile } from "@/lib/pulse/profile"
import { isPulseProfileId } from "@/lib/pulse/constants"
import { getAppMode } from "@/lib/auth/client"
import { postDiscoverLike, postDiscoverPass } from "@/lib/discover/api"
import { discoverIdToNumeric } from "@/lib/discover/map-profile"
import { fetchMatchDetail, sendMatchMessage, type ServerMatchMessage } from "@/lib/matches/api"
import {
  chatThreadUpdatedAt,
  mergeChatThreads,
  serverMessagesToChat,
  threadsFromServerMatches,
} from "@/lib/matches/map-chat"
import { resolveMatchIdForProfile, storeServerMatchId } from "@/lib/matches/resolve"
import { isLocalMatchId } from "@/lib/match-freeze-client"
import type { MessageSentResponse } from "@/lib/server/matches/types"

const SOCIAL_KEY = "ttm-social"

export type ChatMessage = {
  id: string
  from: "me" | "them" | "system"
  text: string
  at: number
}

export type ChatThread = {
  profileId: number
  messages: ChatMessage[]
  updatedAt: number
}

type SocialState = {
  likedYou: number[]
  yourLikes: number[]
  passed: number[]
  matches: number[]
  chats: ChatThread[]
  seeded: boolean
}

const DEFAULT: SocialState = {
  likedYou: [],
  yourLikes: [],
  passed: [],
  matches: [],
  chats: [],
  seeded: false,
}

function load(): SocialState {
  if (typeof window === "undefined") return { ...DEFAULT }
  try {
    const raw = localStorage.getItem(SOCIAL_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = { ...DEFAULT, ...JSON.parse(raw) } as SocialState
    parsed.chats = parsed.chats.filter((c) => c.profileId > 0)
    return parsed
  } catch {
    return { ...DEFAULT }
  }
}

function save(state: SocialState) {
  if (typeof window === "undefined") return
  localStorage.setItem(SOCIAL_KEY, JSON.stringify(state))
}

const GREETINGS: Partial<Record<Locale, string[]>> = {
  ru: [
    "Привет! Рада взаимной симпатии 👋",
    "Привет! Как дела?",
    "О, мы совпали! Давай познакомимся?",
  ],
  uk: [
    "Привіт! Рада взаємній симпатії 👋",
    "Привіт! Як справи?",
    "О, ми збіглися! Давай познайомимось?",
  ],
  en: [
    "Hey! Glad we matched 👋",
    "Hi! How's your day?",
    "We matched! Want to chat?",
  ],
}

function ensureSeeded(state: SocialState, locale: Locale, position: GeoPosition | null): SocialState {
  if (state.seeded) return state
  const user = getUserProfile()
  const all = filterProfilesForUser(buildDemoSwipeProfiles(locale, position), user)
  const pick = [0, 2, 4, 6, 8, 10]
    .map((i) => all[i]?.id)
    .filter((id): id is number => id != null)
  return {
    ...state,
    likedYou: pick,
    seeded: true,
  }
}

function syncConnections(state: SocialState) {
  const chatTimes = new Map(state.chats.map((c) => [c.profileId, c.updatedAt]))
  migrateConnectionsFromMatches(state.matches, chatTimes)
}

export function getSocialState(locale: Locale, position: GeoPosition | null) {
  let state = load()
  if (!state.seeded) {
    state = ensureSeeded(state, locale, position)
    save(state)
  }
  syncConnections(state)
  return state
}

export function getProfileById(
  id: number,
  locale: Locale,
  position: GeoPosition | null
): SwipeProfile | undefined {
  if (id <= 0) return undefined
  if (isPulseProfileId(id)) return getPulseProfile(locale)
  return buildDemoSwipeProfiles(locale, position).find((p) => p.id === id)
}

/** Removes a chat thread locally. Pulse AI chat cannot be deleted. */
export function deleteChatThread(profileId: number): boolean {
  if (profileId <= 0 || isPulseProfileId(profileId)) return false
  let state = load()
  const before = state.chats.length
  state = { ...state, chats: state.chats.filter((c) => c.profileId !== profileId) }
  if (state.chats.length === before) return false
  save(state)
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`ttm-chat-seen:${profileId}`)
    window.dispatchEvent(new CustomEvent("ttm-social-updated"))
  }
  return true
}

export function getLikedYouProfiles(locale: Locale, position: GeoPosition | null): SwipeProfile[] {
  const { likedYou } = getSocialState(locale, position)
  const all = filterProfilesForUser(buildDemoSwipeProfiles(locale, position))
  return likedYou
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is SwipeProfile => Boolean(p))
}

export function getMatchProfiles(locale: Locale, position: GeoPosition | null): SwipeProfile[] {
  const { matches } = getSocialState(locale, position)
  const all = filterProfilesForUser(buildDemoSwipeProfiles(locale, position))
  return matches
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is SwipeProfile => Boolean(p))
}

export function getChatMessagesForProfile(profileId: number): ChatMessage[] {
  const thread = load().chats.find((c) => c.profileId === profileId)
  return thread?.messages ?? []
}

export function getChats(locale: Locale, position: GeoPosition | null): ChatThread[] {
  const state = getSocialState(locale, position)
  return [...state.chats].sort((a, b) => b.updatedAt - a.updatedAt)
}

function applyLocalSwipeState(
  state: SocialState,
  profile: SwipeProfile,
  direction: "left" | "right",
  matched: boolean
): SocialState {
  let next = { ...state }
  if (direction === "left") {
    if (!next.passed.includes(profile.id)) next.passed.push(profile.id)
    return next
  }

  if (!next.yourLikes.includes(profile.id)) next.yourLikes.push(profile.id)
  if (matched && !next.matches.includes(profile.id)) {
    next.matches.push(profile.id)
  }
  return next
}

function finalizeSwipeSideEffects(
  profile: SwipeProfile,
  direction: "left" | "right",
  matched: boolean,
  locale: Locale,
  state: SocialState
) {
  save(state)
  recordProfileActivity()
  if (typeof window === "undefined") return

  window.dispatchEvent(new CustomEvent("ttm-social-updated"))
  if (matched && direction === "right") {
    ensureConnectionForMatch(profile.id)
    setMemoryProfileName(profile.id, profile.name)
    recordConnectionMessage(profile.id, "them")
    emitActivityBump("matches")
    void import("@/lib/gamification/api").then(({ reportAchievementEvent, dispatchGamificationUpdate }) =>
      reportAchievementEvent({ event: "match_created" }).then((snap) =>
        dispatchGamificationUpdate(snap ?? undefined)
      )
    )
  } else if (
    direction === "right" &&
    state.likedYou.includes(profile.id) &&
    !state.matches.includes(profile.id)
  ) {
    emitActivityBump("likes")
  }
}

async function tryServerSwipe(
  profile: SwipeProfile,
  direction: "left" | "right"
): Promise<{ matched: boolean; matchId?: string } | null> {
  if (!profile.userId || typeof window === "undefined") return null

  const mode = await getAppMode()
  if (mode === "demo") return null

  if (direction === "right") {
    const res = await postDiscoverLike(profile.userId)
    if (!res.ok) {
      if ("demoFallback" in res && res.demoFallback) return null
      return null
    }
    if (res.matched && res.matchId) {
      storeServerMatchId(profile.id, res.matchId)
    }
    return { matched: res.matched, matchId: res.matched ? res.matchId : undefined }
  }

  const res = await postDiscoverPass(profile.userId)
  if (!res.ok) {
    if ("demoFallback" in res && res.demoFallback) return null
    return null
  }
  return { matched: false }
}

function recordSwipeLocal(
  profile: SwipeProfile,
  direction: "left" | "right",
  locale: Locale,
  position: GeoPosition | null
): { matched: boolean; state: SocialState } {
  let state = load()
  state = ensureSeeded(state, locale, position)

  if (direction === "left") {
    if (!state.passed.includes(profile.id)) state.passed.push(profile.id)
    return { matched: false, state }
  }

  if (!state.yourLikes.includes(profile.id)) state.yourLikes.push(profile.id)

  const alreadyLikedYou = state.likedYou.includes(profile.id)
  let matched = false

  if (alreadyLikedYou) {
    if (!state.matches.includes(profile.id)) {
      state.matches.push(profile.id)
      matched = true
      const greetings = GREETINGS[locale] ?? GREETINGS.en ?? []
      const text = greetings[profile.id % greetings.length] ?? greetings[0] ?? "Hey!"
      const existing = state.chats.find((c) => c.profileId === profile.id)
      if (!existing) {
        state.chats.push({
          profileId: profile.id,
          updatedAt: Date.now(),
          messages: [
            {
              id: `m-${Date.now()}`,
              from: "them",
              text,
              at: Date.now(),
            },
          ],
        })
      }
    }
  } else if (Math.random() < 0.35 && !state.likedYou.includes(profile.id)) {
    state.likedYou.push(profile.id)
  }

  return { matched, state }
}

export async function recordSwipe(
  profile: SwipeProfile,
  direction: "left" | "right",
  locale: Locale,
  position: GeoPosition | null
): Promise<{ matched: boolean }> {
  const serverResult = await tryServerSwipe(profile, direction)
  if (serverResult) {
    let state = load()
    state = ensureSeeded(state, locale, position)
    state = applyLocalSwipeState(state, profile, direction, serverResult.matched)
    finalizeSwipeSideEffects(profile, direction, serverResult.matched, locale, state)
    return serverResult
  }

  const { matched, state } = recordSwipeLocal(profile, direction, locale, position)
  finalizeSwipeSideEffects(profile, direction, matched, locale, state)
  return { matched }
}

export async function likeBack(
  profileId: number,
  locale: Locale,
  position: GeoPosition | null
): Promise<boolean> {
  const profile = getProfileById(profileId, locale, position)
  if (!profile) return false
  const result = await recordSwipe(profile, "right", locale, position)
  return result.matched || getSocialState(locale, position).matches.includes(profileId)
}

function pushMessage(
  state: SocialState,
  profileId: number,
  from: "me" | "them" | "system",
  text: string,
  locale: Locale,
  position: GeoPosition | null
): SocialState {
  const trimmed = text.trim()
  if (!trimmed || profileId <= 0) return state

  const now = Date.now()
  let next = ensureSeeded(state, locale, position)
  let thread = next.chats.find((c) => c.profileId === profileId)

  if (!thread) {
    thread = { profileId, messages: [], updatedAt: now }
    next = { ...next, chats: [...next.chats, thread] }
  }

  const updatedThread: ChatThread = {
    ...thread,
    messages: [...thread.messages, { id: `m-${now}-${from}`, from, text: trimmed, at: now }],
    updatedAt: now,
  }

  next = {
    ...next,
    chats: next.chats.map((c) => (c.profileId === profileId ? updatedThread : c)),
  }

  save(next)
  if (from !== "system") {
    recordConnectionMessage(profileId, from === "me" ? "me" : "them")
    if (from === "me") recordProfileActivity()
  }
  const profile = getProfileById(profileId, locale, position)
  if (profile) setMemoryProfileName(profileId, profile.name)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ttm-social-updated"))
    if (from === "them") emitActivityBump("chats")
    broadcastPresenceUpdate({ profileId, source: "social" })
  }
  return next
}

export function sendMessage(
  profileId: number,
  text: string,
  locale: Locale,
  position: GeoPosition | null
) {
  pushMessage(load(), profileId, "me", text, locale, position)
}

export function appendSystemMessage(
  profileId: number,
  text: string,
  locale: Locale,
  position: GeoPosition | null
) {
  pushMessage(load(), profileId, "system", text, locale, position)
}

export function receiveMessage(
  profileId: number,
  text: string,
  locale: Locale,
  position: GeoPosition | null
) {
  pushMessage(load(), profileId, "them", text, locale, position)
}

export function getUnreadLikesCount(locale: Locale, position: GeoPosition | null): number {
  const { likedYou, yourLikes, matches } = getSocialState(locale, position)
  return likedYou.filter((id) => !yourLikes.includes(id) && !matches.includes(id)).length
}

export function getUnreadChatsCount(): number {
  return 0
}

function replaceThreadMessages(
  state: SocialState,
  profileId: number,
  messages: ChatMessage[],
  locale: Locale,
  position: GeoPosition | null
): SocialState {
  const next = ensureSeeded(state, locale, position)
  const updatedAt = chatThreadUpdatedAt(messages)
  const existing = next.chats.find((c) => c.profileId === profileId)
  const thread: ChatThread = existing
    ? { ...existing, messages, updatedAt }
    : { profileId, messages, updatedAt }
  return {
    ...next,
    chats: existing
      ? next.chats.map((c) => (c.profileId === profileId ? thread : c))
      : [...next.chats, thread],
  }
}

/** Sync server messages into local chat cache (read-through for production). */
export function syncServerThreadMessages(
  profileId: number,
  serverMessages: ServerMatchMessage[],
  locale: Locale,
  position: GeoPosition | null
): ChatThread {
  const messages = serverMessagesToChat(serverMessages)
  const next = replaceThreadMessages(load(), profileId, messages, locale, position)
  save(next)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ttm-social-updated"))
  }
  const thread = next.chats.find((c) => c.profileId === profileId)
  return thread ?? { profileId, messages, updatedAt: chatThreadUpdatedAt(messages) }
}

/** Build chat inbox from GET /api/matches in production; null = use local demo store. */
export async function loadServerChatThreads(
  locale: Locale,
  position: GeoPosition | null
): Promise<ChatThread[] | null> {
  const mode = await getAppMode()
  if (mode === "demo") return null

  const { fetchActiveMatches } = await import("@/lib/match-freeze-client")
  const matches = await fetchActiveMatches()
  const local = getSocialState(locale, position)
  for (const m of matches) {
    storeServerMatchId(discoverIdToNumeric(m.peerUserId), m.id)
  }
  return threadsFromServerMatches(matches, local.chats)
}

export type SendChatMessageResult =
  | { mode: "local" }
  | { mode: "server"; payload: MessageSentResponse; matchId: string; systemMessage?: string }
  | { mode: "error"; reason: string }

/** Send chat message — server in production, localStorage fallback in demo. */
export async function sendChatMessage(
  profileId: number,
  text: string,
  locale: Locale,
  position: GeoPosition | null
): Promise<SendChatMessageResult> {
  const trimmed = text.trim()
  if (!trimmed || profileId <= 0) return { mode: "error", reason: "empty" }

  const mode = await getAppMode()
  if (mode === "demo") {
    sendMessage(profileId, trimmed, locale, position)
    return { mode: "local" }
  }

  const matchId = await resolveMatchIdForProfile(profileId)
  if (isLocalMatchId(matchId)) {
    sendMessage(profileId, trimmed, locale, position)
    return { mode: "local" }
  }

  const result = await sendMatchMessage(matchId, trimmed)
  if (!result.ok) {
    if ("demoFallback" in result && result.demoFallback) {
      sendMessage(profileId, trimmed, locale, position)
      return { mode: "local" }
    }
    return { mode: "error", reason: ("error" in result ? result.error : undefined) ?? "send_failed" }
  }

  const detail = await fetchMatchDetail(matchId)
  if (detail.ok) {
    syncServerThreadMessages(profileId, detail.match.messages, locale, position)
  } else {
    pushMessage(load(), profileId, "me", trimmed, locale, position)
  }

  const payload: MessageSentResponse = {
    ...(result.bond ?? {
      prolonged: false,
      bondLevel: 0,
      totalMessages: 0,
      bondProgress: 0,
      prolongCount: 0,
      messagesUntilNext: 5,
    }),
    systemMessage: result.systemMessage,
    gamification: result.gamification,
  }

  if (typeof window !== "undefined" && result.bond) {
    window.dispatchEvent(
      new CustomEvent("ttm-bond-updated", { detail: { profileId, payload, matchId } })
    )
    if (payload.prolonged) {
      window.dispatchEvent(new CustomEvent("ttm-connection-updated"))
    }
  }

  return {
    mode: "server",
    payload,
    matchId,
    systemMessage: result.systemMessage,
  }
}

/** Load persisted messages for an open chat thread. */
export async function loadServerMessagesForProfile(
  profileId: number,
  locale: Locale,
  position: GeoPosition | null
): Promise<ChatThread | null> {
  const mode = await getAppMode()
  if (mode === "demo") return null

  const matchId = await resolveMatchIdForProfile(profileId)
  if (isLocalMatchId(matchId)) return null

  const detail = await fetchMatchDetail(matchId)
  if (!detail.ok) return null

  return syncServerThreadMessages(profileId, detail.match.messages, locale, position)
}

/** Merge server match list with local demo threads for inbox display. */
export async function getChatsWithServerSync(
  locale: Locale,
  position: GeoPosition | null
): Promise<ChatThread[]> {
  const local = getChats(locale, position)
  const serverThreads = await loadServerChatThreads(locale, position)
  if (serverThreads === null) return local
  return mergeChatThreads(local, serverThreads)
}
