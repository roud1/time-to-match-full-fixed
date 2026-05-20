import { getUserProfile, updateUserProfile } from "@/lib/user-profile"
import { computeProfileLife, type ProfileLifeView } from "@/lib/profile-life"

const LIFE_KEY = "ttm-profile-life"

type ProfileLifeMeta = {
  lastActiveAt: number
  revivedAt?: number
}

function loadMeta(): ProfileLifeMeta | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LIFE_KEY)
    if (raw) return JSON.parse(raw) as ProfileLifeMeta
  } catch {
    /* ignore */
  }
  const profile = getUserProfile()
  if (!profile) return null
  return { lastActiveAt: profile.registeredAt }
}

function saveMeta(meta: ProfileLifeMeta) {
  if (typeof window === "undefined") return
  localStorage.setItem(LIFE_KEY, JSON.stringify(meta))
}

function dispatch() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("ttm-profile-life-updated"))
}

export function getLastActiveAt(): number {
  const meta = loadMeta()
  const profile = getUserProfile()
  return meta?.lastActiveAt ?? profile?.registeredAt ?? Date.now()
}

export function recordProfileActivity(): ProfileLifeView {
  const now = Date.now()
  const meta: ProfileLifeMeta = { lastActiveAt: now, revivedAt: now }
  saveMeta(meta)
  dispatch()
  return computeProfileLife(now, now)
}

export function getProfileLifeView(now = Date.now()): ProfileLifeView | null {
  const profile = getUserProfile()
  if (!profile) return null
  const lastActiveAt = getLastActiveAt()
  return computeProfileLife(lastActiveAt, now)
}

/** Restore presence after sleep or archive — never deletes profile data. */
export function reviveProfilePresence(): ProfileLifeView | null {
  const view = recordProfileActivity()
  const profile = getUserProfile()
  if (profile) {
    updateUserProfile({})
  }
  return view
}

/** Demo helper: simulate inactivity for UI preview (dev only via query). */
export function setDemoIdleMs(idleMs: number) {
  const lastActiveAt = Date.now() - idleMs
  saveMeta({ lastActiveAt })
  dispatch()
}
