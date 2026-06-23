import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { listAllInterests } from "@/server/repositories/interests"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ interests: [] }))
  }

  const interests = await listAllInterests()
  return withCors(request, jsonOk({ interests }))
}
