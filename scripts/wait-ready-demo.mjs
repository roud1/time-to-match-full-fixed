#!/usr/bin/env node
/**
 * Poll GET /api/ready until it responds 200 (demo mode — no database needed).
 * Used by build CI job before Playwright smoke tests.
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
      if (res.ok) {
        console.log(`✓ Server ready — mode=${json.mode} (${Math.round((Date.now()-start)/1000)}s)`)
        return
      }
      console.log(`  … status=${res.status} mode=${json.mode ?? "?"}`)
    } catch (err) {
      console.log(`  … ${err instanceof Error ? err.message : String(err)}`)
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }

  console.error(`Timed out after ${maxMs}ms`)
  process.exit(1)
}

main().catch((err) => { console.error(err); process.exit(1) })
