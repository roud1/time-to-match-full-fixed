"use client"

export type OwnPhotoVerificationStatus = "none" | "pending" | "verified"

export type TrustSafetyState = {
  blockedIds: number[]
  mutedIds: number[]
  reports: { profileId: number; reasonKey: string; at: number }[]
  ownVerification: {
    emailDone: boolean
    photoStatus: OwnPhotoVerificationStatus
    photoSubmittedAt?: number
  }
}

const KEY = "ttm-trust-safety"

function defaultState(): TrustSafetyState {
  return {
    blockedIds: [],
    mutedIds: [],
    reports: [],
    ownVerification: {
      emailDone: false,
      photoStatus: "none",
    },
  }
}

function notify() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("ttm-trust-updated"))
}

function load(): TrustSafetyState {
  if (typeof window === "undefined") return defaultState()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<TrustSafetyState>
    const base = defaultState()
    return {
      blockedIds: Array.isArray(parsed.blockedIds) ? parsed.blockedIds.map(Number).filter(Number.isFinite) : base.blockedIds,
      mutedIds: Array.isArray(parsed.mutedIds) ? parsed.mutedIds.map(Number).filter(Number.isFinite) : base.mutedIds,
      reports: Array.isArray(parsed.reports)
        ? parsed.reports.filter((r) => r && typeof r.profileId === "number" && typeof r.reasonKey === "string")
        : base.reports,
      ownVerification: {
        emailDone: Boolean(parsed.ownVerification?.emailDone),
        photoStatus:
          parsed.ownVerification?.photoStatus === "pending" ||
          parsed.ownVerification?.photoStatus === "verified" ||
          parsed.ownVerification?.photoStatus === "none"
            ? parsed.ownVerification.photoStatus
            : base.ownVerification.photoStatus,
        photoSubmittedAt:
          typeof parsed.ownVerification?.photoSubmittedAt === "number"
            ? parsed.ownVerification.photoSubmittedAt
            : undefined,
      },
    }
  } catch {
    return defaultState()
  }
}

function save(state: TrustSafetyState) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(state))
  notify()
}

export function getTrustSafetyState(): TrustSafetyState {
  return load()
}

export function isProfileBlocked(profileId: number): boolean {
  return load().blockedIds.includes(profileId)
}

export function isProfileMuted(profileId: number): boolean {
  return load().mutedIds.includes(profileId)
}

export function blockProfile(profileId: number) {
  const s = load()
  if (s.blockedIds.includes(profileId)) return
  s.blockedIds.push(profileId)
  s.mutedIds = s.mutedIds.filter((id) => id !== profileId)
  save(s)
}

export function unblockProfile(profileId: number) {
  const s = load()
  s.blockedIds = s.blockedIds.filter((id) => id !== profileId)
  save(s)
}

export function muteProfile(profileId: number) {
  const s = load()
  if (s.mutedIds.includes(profileId)) return
  s.mutedIds.push(profileId)
  save(s)
}

export function unmuteProfile(profileId: number) {
  const s = load()
  s.mutedIds = s.mutedIds.filter((id) => id !== profileId)
  save(s)
}

export function submitReport(profileId: number, reasonKey: string) {
  const s = load()
  s.reports.push({ profileId, reasonKey, at: Date.now() })
  save(s)
}

export function setOwnEmailVerified(done: boolean) {
  const s = load()
  s.ownVerification.emailDone = done
  save(s)
}

export function setOwnPhotoStatus(status: OwnPhotoVerificationStatus, submittedAt?: number) {
  const s = load()
  s.ownVerification.photoStatus = status
  s.ownVerification.photoSubmittedAt = submittedAt
  save(s)
}

export const REPORT_REASON_KEYS = [
  "trustReportHarassment",
  "trustReportSpam",
  "trustReportFake",
  "trustReportInappropriate",
  "trustReportOther",
] as const

export type ReportReasonKey = (typeof REPORT_REASON_KEYS)[number]
