import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin")
  const allowed =
    process.env.CORS_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []
  if (!origin || !allowed.includes(origin)) return {}
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
  }

  const res = NextResponse.next()
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")

  if (request.headers.get("x-forwarded-proto") === "https") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  for (const [k, v] of Object.entries(corsHeaders(request))) {
    res.headers.set(k, v)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/).*)"],
}
