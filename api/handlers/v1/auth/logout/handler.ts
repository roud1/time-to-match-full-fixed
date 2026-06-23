import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/server/auth/jwt"
import { jsonOk, withCors } from "@/server/http"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const res = jsonOk({ ok: true })
  res.cookies.set(AUTH_COOKIE_NAME, "", { ...authCookieOptions(), maxAge: 0 })
  return withCors(request, res)
}
