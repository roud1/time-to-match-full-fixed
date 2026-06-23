import type { AchievementListItem, GamificationSnapshot } from "@/client/lib/gamification/types"

export async function fetchAchievements(): Promise<AchievementListItem[]> {
  const res = await fetch("/api/achievements", { credentials: "include", cache: "no-store" })
  if (!res.ok) return []
  const data = (await res.json()) as { achievements: AchievementListItem[] }
  return data.achievements ?? []
}

export async function reportAchievementEvent(input: {
  event: "match_created" | "message_sent" | "bond_prolonged" | "freeze_used" | "profile_updated"
  messageCount?: number
  prolongCount?: number
  activeMatchesCount?: number
}): Promise<GamificationSnapshot | null> {
  try {
    const res = await fetch("/api/achievements/report", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { gamification: GamificationSnapshot }
    return data.gamification ?? null
  } catch {
    return null
  }
}

export function dispatchGamificationUpdate(snapshot: GamificationSnapshot | null | undefined) {
  if (!snapshot?.unlocked?.length) return
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent("ttm-gamification-updated", { detail: snapshot })
  )
}
