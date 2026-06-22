"use client"

import { getAppMode } from "@/lib/auth/client"
import { discoverIdToNumeric } from "@/lib/discover/map-profile"

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

/** Resolve server UUID from swipe profile id when userId is missing (demo profiles). */
export function profileIdToServerUserId(profileId: number, userId?: string | null): string | null {
  if (userId) return userId
  return null
}

export function numericIdFromUserId(userId: string): number {
  return discoverIdToNumeric(userId)
}
