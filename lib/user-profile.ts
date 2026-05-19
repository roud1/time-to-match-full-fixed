import type { CityId } from "@/lib/cities"
import type { InterestId } from "@/lib/interests"
import { getProfilePhotos } from "@/lib/profile-photos"

const PROFILE_KEY = "ttm-user-profile"
const CREDENTIALS_KEY = "ttm-user-credentials"
const SESSION_KEY = "ttm-session"

export type StoredUserProfile = {
  name: string
  email: string
  cityId?: CityId
  customCity?: string
  bio: string
  interests?: InterestId[]
  gender: "male" | "female" | "other"
  lookingFor: "men" | "women" | "all"
  birthdate?: string
  /** @deprecated use photoUrls */
  photoUrl?: string
  photoUrls?: string[]
  registeredAt: number
  /** Unix ms — demo premium expiry */
  premiumUntil?: number
}

type StoredCredentials = {
  email: string
  password: string
}

type Session = {
  email: string
  remember: boolean
  loggedInAt: number
}

export function saveUserProfile(profile: StoredUserProfile, password: string) {
  if (typeof window === "undefined") return
  const stored = { ...profile }
  if (stored.photoUrls?.length) delete stored.photoUrl
  localStorage.setItem(PROFILE_KEY, JSON.stringify(stored))
  localStorage.setItem(
    CREDENTIALS_KEY,
    JSON.stringify({
      email: profile.email.toLowerCase(),
      password,
    } satisfies StoredCredentials)
  )
}

export function updateUserProfile(
  patch: Partial<Omit<StoredUserProfile, "email" | "registeredAt">>
) {
  if (typeof window === "undefined") return null
  const current = getUserProfile()
  if (!current) return null
  const next = { ...current, ...patch } as StoredUserProfile
  if (patch.photoUrls !== undefined) {
    next.photoUrls = patch.photoUrls
    delete next.photoUrl
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
  return next
}

export function getAgeFromBirthdate(birthdate?: string): number | null {
  if (!birthdate) return null
  const birth = new Date(birthdate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

export function getUserProfile(): StoredUserProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const profile = JSON.parse(raw) as StoredUserProfile
    const photos = getProfilePhotos(profile)
    if (photos.length > 0 && !profile.photoUrls?.length) {
      return { ...profile, photoUrls: photos }
    }
    return profile
  } catch {
    return null
  }
}

function getCredentials(): StoredCredentials | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredCredentials
  } catch {
    return null
  }
}

export function hasRegisteredAccount(): boolean {
  return getUserProfile() !== null && getCredentials() !== null
}

export function verifyLogin(email: string, password: string): boolean {
  const profile = getUserProfile()
  const credentials = getCredentials()
  if (!profile || !credentials) return false

  return (
    profile.email.toLowerCase() === email.trim().toLowerCase() &&
    credentials.email === email.trim().toLowerCase() &&
    credentials.password === password
  )
}

export function setSession(email: string, remember: boolean) {
  if (typeof window === "undefined") return
  const session: Session = {
    email: email.trim().toLowerCase(),
    remember,
    loggedInAt: Date.now(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  const session = getSession()
  const profile = getUserProfile()
  if (!session || !profile) return false
  return session.email === profile.email.toLowerCase()
}

export function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}

export const PROFILE_DURATION_MS = 72 * 60 * 60 * 1000
export const PREMIUM_DURATION_MS = 7 * 24 * 60 * 60 * 1000

export function isPremiumActive(profile: StoredUserProfile): boolean {
  return typeof profile.premiumUntil === "number" && profile.premiumUntil > Date.now()
}

export function activatePremium(profile: StoredUserProfile, durationMs = PREMIUM_DURATION_MS) {
  return updateUserProfile({ premiumUntil: Date.now() + durationMs })
}

export function getPremiumTimeLeft(premiumUntil: number) {
  const remaining = Math.max(0, premiumUntil - Date.now())
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return { days, hours, remaining }
}

export function getProfileTimeLeft(registeredAt: number) {
  const endsAt = registeredAt + PROFILE_DURATION_MS
  const remaining = Math.max(0, endsAt - Date.now())
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  return { hours, minutes, seconds, remaining, endsAt }
}
