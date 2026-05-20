import { NextResponse } from "next/server"
import { dbHealthCheck } from "@/lib/server/db"
import { getServerEnv } from "@/lib/server/env"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return NextResponse.json(
      {
        ready: true,
        mode: "demo",
        database: "not_configured",
      },
      { status: 200 }
    )
  }

  const db = await dbHealthCheck()
  if (!db.ok) {
    return NextResponse.json(
      {
        ready: false,
        mode: "production",
        database: "unhealthy",
        error: db.error,
      },
      { status: 503 }
    )
  }

  return NextResponse.json({
    ready: true,
    mode: "production",
    database: "ok",
    latencyMs: db.latencyMs,
  })
}
