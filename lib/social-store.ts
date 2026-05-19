import type { Locale } from "@/lib/i18n"
import { buildDemoSwipeProfiles, type SwipeProfile } from "@/lib/demo-profiles"
import type { GeoPosition } from "@/lib/geo"

const SOCIAL_KEY = "ttm-social"

export type ChatMessage = {
  id: string
  from: "me" | "them"
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
    return { ...DEFAULT, ...JSON.parse(raw) }
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
  const all = buildDemoSwipeProfiles(locale, position)
  const pick = all
    .filter((p) => p.id % 2 === 1)
    .slice(0, 4)
    .map((p) => p.id)
  return {
    ...state,
    likedYou: pick,
    seeded: true,
  }
}

export function getSocialState(locale: Locale, position: GeoPosition | null) {
  let state = load()
  if (!state.seeded) {
    state = ensureSeeded(state, locale, position)
    save(state)
  }
  return state
}

export function getProfileById(
  id: number,
  locale: Locale,
  position: GeoPosition | null
): SwipeProfile | undefined {
  return buildDemoSwipeProfiles(locale, position).find((p) => p.id === id)
}

export function getLikedYouProfiles(locale: Locale, position: GeoPosition | null): SwipeProfile[] {
  const { likedYou } = getSocialState(locale, position)
  const all = buildDemoSwipeProfiles(locale, position)
  return likedYou
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is SwipeProfile => Boolean(p))
}

export function getMatchProfiles(locale: Locale, position: GeoPosition | null): SwipeProfile[] {
  const { matches } = getSocialState(locale, position)
  const all = buildDemoSwipeProfiles(locale, position)
  return matches
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is SwipeProfile => Boolean(p))
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
  let state = ensureSeeded(load(), locale, position)

  if (direction === "left") {
    if (!state.passed.includes(profile.id)) state.passed.push(profile.id)
    save(state)
    return { matched: false }
  }

  if (!state.yourLikes.includes(profile.id)) state.yourLikes.push(profile.id)

  const alreadyLikedYou = state.likedYou.includes(profile.id)
  let matched = false

  if (alreadyLikedYou || profile.id % 3 === 0) {
    if (!state.likedYou.includes(profile.id)) state.likedYou.push(profile.id)
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
    }
  } else if (Math.random() < 0.35 && !state.likedYou.includes(profile.id)) {
    state.likedYou.push(profile.id)
  }

  save(state)
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

export function sendMessage(
  profileId: number,
  text: string,
  locale: Locale,
  position: GeoPosition | null
) {
  const trimmed = text.trim()
  if (!trimmed) return

  let state = ensureSeeded(load(), locale, position)
  let thread = state.chats.find((c) => c.profileId === profileId)
  const now = Date.now()

  if (!thread) {
    thread = { profileId, messages: [], updatedAt: now }
    state.chats.push(thread)
  }

  thread.messages.push({ id: `m-${now}`, from: "me", text: trimmed, at: now })
  thread.updatedAt = now
  save(state)
}

export function getUnreadLikesCount(locale: Locale, position: GeoPosition | null): number {
  const { likedYou, yourLikes, matches } = getSocialState(locale, position)
  return likedYou.filter((id) => !yourLikes.includes(id) && !matches.includes(id)).length
}

export function getUnreadChatsCount(): number {
  return 0
}
