import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { getFreezePackage } from "@/client/lib/freeze-packages"
import { addFreezeBalance } from "@/server/repositories/users"

export const runtime = "nodejs"

const bodySchema = z.object({
  packageId: z.enum(["small", "medium", "large"]),
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON body" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const pack = getFreezePackage(parsed.data.packageId)
  if (!pack) {
    return withCors(request, jsonError(400, { error: "invalid_package", message: "Unknown package" }))
  }

  const newBalance = await addFreezeBalance(session.sub, pack.count)
  if (newBalance == null) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update balance" }))
  }

  return withCors(request, jsonOk({ success: true, newBalance }))
}
