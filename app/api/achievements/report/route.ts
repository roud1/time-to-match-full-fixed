import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { checkAndGrantAchievements } from "@/lib/server/gamification/check"
import type { AchievementEvent } from "@/lib/server/gamification/types"

export const runtime = "nodejs"

const bodySchema = z.object({
  event: z.enum([
    "match_created",
    "message_sent",
    "bond_prolonged",
    "freeze_used",
    "profile_updated",
  ]),
  messageCount: z.number().int().min(0).optional(),
  prolongCount: z.number().int().min(0).optional(),
  activeMatchesCount: z.number().int().min(0).optional(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
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

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_body", message: "Invalid payload" }))
  }

  const gamification = await checkAndGrantAchievements(session.sub, {
    event: body.event as AchievementEvent,
    messageCount: body.messageCount,
    prolongCount: body.prolongCount,
    activeMatchesCount: body.activeMatchesCount,
    at: new Date(),
  })

  return withCors(request, jsonOk({ gamification }))
}
