export type ProfileActivitySyncResponse = {
  synced: boolean
  demo?: boolean
  profileExpiresAt?: string
  lastActiveAt?: string
}

/** Best-effort server sync for 72h profile life — never throws. */
export async function syncProfileActivityToServer(): Promise<ProfileActivitySyncResponse | null> {
  if (typeof window === "undefined") return null
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
