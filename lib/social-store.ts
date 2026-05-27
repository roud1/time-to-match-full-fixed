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
import { broadcastPresenceUpdate } from "@/lib/presence/realtime-presence"

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

const GREETINGS: Record<Locale, string[]> = {
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
  const pick = all.slice(0, 4).map((p) => p.id)
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
  return buildDemoSwipeProfiles(locale, position).find((p) => p.id === id)
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

export function recordSwipe(
  profile: SwipeProfile,
  direction: "left" | "right",
  locale: Locale,
  position: GeoPosition | null
): { matched: boolean } {
  let state = load()
  state = ensureSeeded(state, locale, position)

  if (direction === "left") {
    if (!state.passed.includes(profile.id)) state.passed.push(profile.id)
    save(state)
    return { matched: false }
  }

  if (!state.yourLikes.includes(profile.id)) state.yourLikes.push(profile.id)

  const alreadyLikedYou = state.likedYou.includes(profile.id)
  let matched = false

  if (alreadyLikedYou) {
    if (!state.matches.includes(profile.id)) {
      state.matches.push(profile.id)
      matched = true
      const greetings = GREETINGS[locale]
      const text = greetings[profile.id % greetings.length]
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
      ensureConnectionForMatch(profile.id)
      setMemoryProfileName(profile.id, profile.name)
      recordConnectionMessage(profile.id, "them")
    }
  } else if (Math.random() < 0.35 && !state.likedYou.includes(profile.id)) {
    state.likedYou.push(profile.id)
  }

  save(state)
  recordProfileActivity()
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ttm-social-updated"))
    if (matched) {
      void import("@/lib/gamification/api").then(({ reportAchievementEvent, dispatchGamificationUpdate }) =>
        reportAchievementEvent({ event: "match_created" }).then((snap) =>
          dispatchGamificationUpdate(snap ?? undefined)
        )
      )
    }
  }
  return { matched }
}

export function likeBack(
  profileId: number,
  locale: Locale,
  position: GeoPosition | null
): boolean {
  const profile = getProfileById(profileId, locale, position)
  if (!profile) return false
  const result = recordSwipe(profile, "right", locale, position)
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
