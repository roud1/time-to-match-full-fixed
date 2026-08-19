#!/usr/bin/env node
/**
 * Poll GET /api/ready until the server responds with a valid JSON body
 * (demo mode — no database needed).
 *
 * NOTE: /api/ready intentionally returns HTTP 503 in demo mode (no
 * DATABASE_URL configured) — that is a correct, healthy response for the
 * build/smoke-test job, which runs without a database. We only need the
 * server process to be up and answering, not "fully ready" in the
 * production sense. So we check for a parsed JSON body with a `mode`
 * field rather than `res.ok`.
 */
const BASE = (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "")
const maxMs = Number(process.env.WAIT_READY_MS || 90_000)
const intervalMs = 2_000

async function main() {
  const start = Date.now()
  console.log(`Waiting for ${BASE}/api/ready (demo mode)…`)

  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/ready`, { headers: { Accept: "application/json" } })
      const json = await res.json().catch(() => ({}))
      // Server is up and answering — 200 (prod-ready) or 503 (demo mode,
      // expected without DATABASE_URL) both mean the process is alive.
      if (json && typeof json.mode === "string") {
        console.log(`✓ Server ready — mode=${json.mode}, status=${res.status} (${Math.round((Date.now()-start)/1000)}s)`)
        return
      }
      console.log(`  … status=${res.status} (no mode field yet)`)
    } catch (err) {
      console.log(`  … ${err instanceof Error ? err.message : String(err)}`)
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }

  console.error(`Timed out after ${maxMs}ms`)
  process.exit(1)
}

main().catch((err) => { console.error(err); process.exit(1) })
