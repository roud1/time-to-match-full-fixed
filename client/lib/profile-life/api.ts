export type ProfileActivitySyncResponse = {
  synced: boolean
  demo?: boolean
  profileExpiresAt?: string
  lastActiveAt?: string
}

/** Activity is recorded on many taps; the server only needs it about once a minute. */
const SYNC_MIN_INTERVAL_MS = 60_000
let lastSyncAt = 0

/** Best-effort server sync for 72h profile life — never throws. `force` skips the 1-minute throttle. */
export async function syncProfileActivityToServer(
  options: { force?: boolean } = {}
): Promise<ProfileActivitySyncResponse | null> {
  if (typeof window === "undefined") return null
  const now = Date.now()
  if (!options.force && now - lastSyncAt < SYNC_MIN_INTERVAL_MS) return null
  lastSyncAt = now
  try {
    const res = await fetch("/api/profile/activity", {
      method: "POST",
      credentials: "include",
    })
    if (!res.ok) return null
    return (await res.json()) as ProfileActivitySyncResponse
  } catch {
    return null
  }
}
