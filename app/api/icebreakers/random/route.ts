import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { jsonOk, withCors } from "@/lib/server/http"
import { listRandomIcebreakers } from "@/lib/server/repositories/icebreakers"

export const runtime = "nodejs"

function parseCount(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 3
  if (!Number.isFinite(n) || n < 1) return 3
  return Math.min(n, 20)
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const count = parseCount(searchParams.get("count"))

  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ icebreakers: [] }))
  }

  const icebreakers = await listRandomIcebreakers(count)
  return withCors(request, jsonOk({ icebreakers }))
}
