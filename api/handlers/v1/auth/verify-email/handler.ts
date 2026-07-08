import { NextResponse } from "next/server"
import { withCors, jsonError, jsonOk } from "@/server/http"
import { verifyEmailToken } from "@/server/email/verification"
import { getServerEnv } from "@/config/env"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonError(503, { error: "service_unavailable" }))
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")?.trim()

  if (!token) {
    return withCors(request, jsonError(400, { error: "missing_token", message: "Token is required" }))
  }

  const result = await verifyEmailToken(token)

  if (!result.ok) {
    const msgs: Record<string, string> = {
      invalid_token:      "This verification link is invalid.",
      token_already_used: "This link has already been used.",
      token_expired:      "This link has expired. Please request a new one.",
      internal_error:     "Something went wrong. Please try again.",
    }
    const message = msgs[result.error ?? ""] ?? "Verification failed."
    // Redirect to login with error param
    const url = new URL("/login", request.url)
    url.searchParams.set("verify_error", result.error ?? "unknown")
    return NextResponse.redirect(url)
  }

  // Redirect to app with success flag
  const url = new URL("/app", request.url)
  url.searchParams.set("email_verified", "1")
  return NextResponse.redirect(url)
}
