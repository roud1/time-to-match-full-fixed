import { NextResponse } from "next/server"
import { jsonOk, withCors } from "@/server/http"
import { getVapidPublicKey } from "@/server/push/web-push"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/**
 * GET /api/push/config — the public VAPID key, read at runtime. The browser needs it to subscribe;
 * reading it here (instead of a NEXT_PUBLIC build-time variable) means changing it on the host
 * works without a rebuild. The public key is not a secret.
 */
export async function GET(request: Request) {
  return withCors(
    request,
    jsonOk({ vapidPublicKey: getVapidPublicKey() }, { headers: { "Cache-Control": "public, max-age=300" } })
  )
}
