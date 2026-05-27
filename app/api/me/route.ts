import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { findUserById } from "@/lib/server/repositories/users"
import { getInterestIdsByUser, listAllInterests } from "@/lib/server/repositories/interests"
import {
  buildAchievementList,
  ensureUserXp,
  getUserXp,
  listUserUnlockedAchievements,
} from "@/lib/server/gamification/repository"
import { xpProgressInLevel } from "@/lib/server/gamification/xp"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const user = await findUserById(session.sub)
  if (!user) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "User not found" }))
  }

  await ensureUserXp(user.id)
  const xpRow = await getUserXp(user.id)
  const xp = xpRow?.xp ?? 0
  const level = xpRow?.level ?? 1
  const xpProg = xpProgressInLevel(xp)
  const achievements = await listUserUnlockedAchievements(user.id)
  const achievementCatalog = await buildAchievementList(user.id)
  const interestIds = await getInterestIdsByUser(user.id)
  const catalog = await listAllInterests()
  const interests = catalog.filter((i) => interestIds.includes(i.id))

  return withCors(
    request,
    jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        freeze_balance: user.freeze_balance ?? 0,
        last_freeze_at: user.last_freeze_at?.toISOString() ?? null,
        email_verified: user.email_verified ?? false,
        photo_verified: user.photo_verified ?? false,
        has_push_subscription: Boolean(user.push_subscription?.endpoint),
        profileExpiresAt: user.profile_expires_at?.toISOString() ?? null,
        purpose: user.purpose ?? null,
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
        maxDistance: user.max_distance ?? 50,
        interests,
        interestIds,
        xp,
        level,
        xpInLevel: xpProg.xpInLevel,
        xpForNextLevel: xpProg.xpForNextLevel,
        xpProgress: xpProg.progress,
        achievements,
        achievementCatalog,
      },
    })
  )
}
