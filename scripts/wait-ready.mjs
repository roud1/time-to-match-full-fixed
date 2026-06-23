#!/usr/bin/env node
/**
 * Poll GET /api/ready until production mode with healthy database.
 * Used by CI and npm run test:e2e:ci before Playwright / smoke-test.
 */
const BASE = (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "")
const maxMs = Number(process.env.WAIT_READY_MS || 120_000)
const intervalMs = 2_000

async function check() {
  const res = await fetch(`${BASE}/api/ready`, { headers: { Accept: "application/json" } })
  const json = await res.json().catch(() => ({}))
  return { res, json }
}

async function main() {
  const start = Date.now()
  console.log(`Waiting for ${BASE}/api/ready (production + database ok)…`)

  while (Date.now() - start < maxMs) {
    try {
      const { res, json } = await check()
      if (res.ok && json.mode === "production" && json.database === "ok" && json.auth === "ok") {
        console.log(`Ready (${json.latencyMs ?? "?"}ms db latency)`)
        return
      }
      console.log(
        `  … status=${res.status} mode=${json.mode ?? "?"} database=${json.database ?? "?"} auth=${json.auth ?? "?"}`
      )
    } catch (err) {
      console.log(`  … ${err instanceof Error ? err.message : String(err)}`)
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }

  console.error(`Timed out after ${maxMs}ms waiting for ${BASE}/api/ready`)
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
