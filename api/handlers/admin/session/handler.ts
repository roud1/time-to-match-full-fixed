import { NextResponse } from "next/server"
import { z } from "zod"
import { adminNotConfigured } from "@/server/auth/admin"
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  signAdminSessionToken,
} from "@/server/auth/admin-session"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"

export const runtime = "nodejs"

const bodySchema = z.object({
  apiKey: z.string().min(8),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/admin/session — validate ADMIN_API_KEY and set HttpOnly admin cookie */
export async function POST(request: Request) {
  if (adminNotConfigured()) {
    return withCors(
      request,
      jsonError(503, { error: "admin_not_configured", message: "ADMIN_API_KEY not set" })
    )
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

  const expected = process.env.ADMIN_API_KEY
  if (!expected || parsed.data.apiKey !== expected) {
    return withCors(request, jsonError(403, { error: "forbidden", message: "Invalid admin key" }))
  }

  const token = await signAdminSessionToken()
  const response = jsonOk({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions())
  return withCors(request, response)
}

/** DELETE /api/admin/session — clear admin cookie */
export async function DELETE(request: Request) {
  const response = jsonOk({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(),
    maxAge: 0,
  })
  return withCors(request, response)
}
