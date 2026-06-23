import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { REFRESH_COOKIE_NAME } from "@/server/auth/cookies"
import { clearAuthCookies, revokeAuthSession } from "@/server/auth/refresh"
import { jsonOk, withCors } from "@/server/http"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const jar = await cookies()
  const rawRefresh = jar.get(REFRESH_COOKIE_NAME)?.value
  await revokeAuthSession(rawRefresh)

  const res = jsonOk({ ok: true })
  clearAuthCookies(res)
  return withCors(request, res)
}
