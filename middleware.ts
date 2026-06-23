import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  isProtectedAppPath,
  isProtectedApiPath,
  isRequestAuthenticated,
  hasRefreshCookie,
  buildRefreshRedirectUrl,
  isDemoModeEnv,
} from "@/server/auth/middleware-auth"

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

function applySecurityHeaders(res: NextResponse, request: NextRequest) {
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
}

function unauthorizedApiResponse(request: NextRequest): NextResponse {
  const res = NextResponse.json(
    { error: "unauthenticated", message: "Invalid or expired session" },
    { status: 401 }
  )
  applySecurityHeaders(res, request)
  return res
}

/**
 * Edge middleware auth:
 * - Protected pages: require valid access JWT (or demo session); auto-refresh via redirect when refresh cookie exists.
 * - Protected API routes: require valid access JWT (or demo); clients call POST /api/v1/auth/refresh on 401.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
  }

  const demoMode = isDemoModeEnv()
  const authenticated = await isRequestAuthenticated(request)

  if (isProtectedAppPath(path) && !authenticated) {
    if (!demoMode && hasRefreshCookie(request)) {
      const returnPath = `${path}${request.nextUrl.search}`
      return NextResponse.redirect(buildRefreshRedirectUrl(request, returnPath))
    }
    const login = new URL("/login", request.url)
    login.searchParams.set("next", `${path}${request.nextUrl.search}`)
    return NextResponse.redirect(login)
  }

  if (isProtectedApiPath(path) && !authenticated) {
    return unauthorizedApiResponse(request)
  }

  const res = NextResponse.next()
  applySecurityHeaders(res, request)
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/).*)"],
}
