import { authorizeCron } from "@/server/cron-auth"
import { getServerEnv } from "@/config/env"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { log } from "@/server/log"
import { GET as expireMatches } from "@/api/handlers/v1/cron/expire-matches/handler"
import { GET as aiAnalysis } from "@/api/handlers/v1/cron/ai-analysis/handler"
import { GET as notify } from "@/api/handlers/v1/cron/notify/handler"

export const runtime = "nodejs"

/**
 * One endpoint for an external scheduler (e.g. cron-job.org, every 5 minutes) instead of three jobs:
 * runs expire-matches, ai-analysis and notify in sequence. Same CRON_SECRET auth as the others.
 */
const JOBS: Array<[string, (request: Request) => Promise<Response>]> = [
  ["expire-matches", expireMatches],
  ["ai-analysis", aiAnalysis],
  ["notify", notify],
]

async function handleTick(request: Request) {
  if (!getServerEnv().isDatabaseConfigured) {
    return withCors(request, jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" }))
  }
  if (!authorizeCron(request)) {
    return withCors(request, jsonError(401, { error: "unauthorized", message: "Invalid cron secret" }))
  }

  const results: Record<string, number> = {}
  for (const [name, job] of JOBS) {
    try {
      results[name] = (await job(request)).status
    } catch (e) {
      log.error("cron_tick_job_err", { job: name, err: e instanceof Error ? e.message : String(e) })
      results[name] = 500
    }
  }
  const ok = Object.values(results).every((status) => status < 400)
  return withCors(request, jsonOk({ ok, results }))
}

export async function GET(request: Request) {
  return handleTick(request)
}

export async function POST(request: Request) {
  return handleTick(request)
}
