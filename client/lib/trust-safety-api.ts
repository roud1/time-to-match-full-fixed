"use client"

import { getAppMode } from "@/client/lib/auth/client"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"

export async function submitReportOnServer(input: {
  reportedUserId: string
  reasonKey: string
}): Promise<{ ok: boolean; demo?: boolean }> {
  const mode = await getAppMode()
  if (mode === "demo") return { ok: true, demo: true }

  try {
    const res = await fetch("/api/v1/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    })
    if (!res.ok) return { ok: false }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function blockUserOnServer(input: {
  blockedUserId: string
  action: "block" | "unblock"
}): Promise<{ ok: boolean; demo?: boolean }> {
  const mode = await getAppMode()
  if (mode === "demo") return { ok: true, demo: true }

  try {
    const res = await fetch("/api/v1/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    })
    if (!res.ok) return { ok: false }
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function unblockUserOnServer(blockedUserId: string): Promise<{ ok: boolean; demo?: boolean }> {
  return blockUserOnServer({ blockedUserId, action: "unblock" })
}

export type BlockedUserEntry = {
  blockedUserId: string
  blockedProfileId: number
}

export async function fetchBlockedUsersOnServer(): Promise<{
  ok: boolean
  blocked: BlockedUserEntry[]
  demo?: boolean
}> {
  const mode = await getAppMode()
  if (mode === "demo") {
    return { ok: true, blocked: [], demo: true }
  }

  try {
    const res = await fetch("/api/v1/block", { credentials: "include" })
    if (!res.ok) return { ok: false, blocked: [] }
    const data = (await res.json()) as {
      blockedUserIds?: string[]
      blockedProfileIds?: number[]
    }
    const ids = data.blockedUserIds ?? []
    const profileIds = data.blockedProfileIds ?? ids.map((id) => discoverIdToNumeric(id))
    return {
      ok: true,
      blocked: ids.map((blockedUserId, i) => ({
        blockedUserId,
        blockedProfileId: profileIds[i] ?? discoverIdToNumeric(blockedUserId),
      })),
    }
  } catch {
    return { ok: false, blocked: [] }
  }
}

/** Resolve server UUID from swipe profile id when userId is missing (demo profiles). */
export function profileIdToServerUserId(profileId: number, userId?: string | null): string | null {
  if (userId) return userId
  return null
}

export function numericIdFromUserId(userId: string): number {
  return discoverIdToNumeric(userId)
}
