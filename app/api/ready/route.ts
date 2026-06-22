import { NextResponse } from "next/server"
import { dbHealthCheck } from "@/lib/server/db"
import { getProductionEnvIssues, getServerEnv } from "@/lib/server/env"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const env = getServerEnv()
  const configIssues = getProductionEnvIssues()
  const hasConfigErrors = configIssues.some((i) => i.severity === "error")

  if (!env.isDatabaseConfigured) {
    return NextResponse.json(
      {
        ready: !hasConfigErrors,
        mode: "demo",
        database: "not_configured",
        auth: "not_configured",
        ...(configIssues.length ? { configIssues } : {}),
      },
      { status: hasConfigErrors ? 503 : 200 }
    )
  }

  if (!env.isAuthConfigured) {
    return NextResponse.json(
      {
        ready: false,
        mode: "production",
        database: "configured",
        auth: "not_configured",
        configIssues,
      },
      { status: 503 }
    )
  }

  const db = await dbHealthCheck()
  if (!db.ok) {
    return NextResponse.json(
      {
        ready: false,
        mode: "production",
        database: "unhealthy",
        auth: "ok",
        error: db.error,
        ...(configIssues.length ? { configIssues } : {}),
      },
      { status: 503 }
    )
  }

  const ready = !hasConfigErrors

  return NextResponse.json(
    {
      ready,
      mode: "production",
      database: "ok",
      auth: "ok",
      latencyMs: db.latencyMs,
      ...(configIssues.length ? { configIssues } : {}),
    },
    { status: ready ? 200 : 503 }
  )
}
