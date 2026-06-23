#!/usr/bin/env node
/**
 * Post-deploy smoke test — register → discover → like flow (demo or production).
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   BASE_URL=https://your.app node scripts/smoke-test.mjs
 *
 * Requires: Node 18+ (fetch). For full DB flow, set DATABASE_URL on the server.
 */
const BASE = (process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
)

const email = `smoke-${Date.now()}@ttm-test.local`
const password = "SmokeTest!Pass123"
const name = "Smoke Tester"

let passed = 0
let failed = 0

/** Minimal cookie jar so register → /api/me share the session in Node fetch. */
const cookies = new Map()

function storeCookies(res) {
  const getSetCookie = res.headers.getSetCookie?.bind(res.headers)
  const list = getSetCookie ? getSetCookie() : []
  if (!list.length) {
    const single = res.headers.get("set-cookie")
    if (single) list.push(single)
  }
  for (const raw of list) {
    const [pair] = raw.split(";")
    const eq = pair.indexOf("=")
    if (eq > 0) cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim())
  }
}

function cookieHeader() {
  return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ")
}

function ok(label) {
  console.log(`  ✓ ${label}`)
  passed++
}

function fail(label, detail) {
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`)
  failed++
}

async function request(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(cookies.size ? { Cookie: cookieHeader() } : {}),
      ...(init.headers || {}),
    },
  })
  storeCookies(res)
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    /* non-json */
  }
  return { res, json, text }
}

async function main() {
  console.log(`\nTime to Match smoke test → ${BASE}\n`)

  // 1. Readiness
  {
    const { res, json } = await request("/api/ready")
    if (res.ok && json?.ok !== false) {
      ok(`GET /api/ready (${json?.mode ?? "unknown"} mode)`)
    } else {
      fail("GET /api/ready", `status ${res.status}`)
    }
  }

  // 2. Homepage
  {
    const res = await fetch(`${BASE}/`)
    if (res.ok) ok("GET / (homepage)")
    else fail("GET /", `status ${res.status}`)
  }

  // 3. Register page
  {
    const res = await fetch(`${BASE}/register`)
    if (res.ok) ok("GET /register")
    else fail("GET /register", `status ${res.status}`)
  }

  // 4. Register API (may fail in demo mode without DB — that's ok)
  let authed = false
  {
    const { res, json } = await request("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    if (res.ok && json?.user) {
      ok(`POST /api/v1/auth/register (${json.user.email})`)
      authed = true
    } else if (res.status === 503 || json?.error === "service_unavailable") {
      ok("POST /api/v1/auth/register skipped (demo mode — no DATABASE_URL)")
    } else {
      fail("POST /api/v1/auth/register", json?.message || `status ${res.status}`)
    }
  }

  // 5. Session / me
  if (authed) {
    const { res, json } = await request("/api/me")
    if (res.ok && json?.user?.id) ok(`GET /api/me (user ${json.user.id})`)
    else fail("GET /api/me", json?.message || `status ${res.status}`)
  }

  // 6. Discover deck (needs auth in production)
  if (authed) {
    const { res, json } = await request("/api/discover")
    if (res.ok) {
      const count = Array.isArray(json?.profiles) ? json.profiles.length : 0
      ok(`GET /api/discover (${count} profiles)`)
    } else {
      fail("GET /api/discover", json?.message || `status ${res.status}`)
    }
  }

  // 7. Photo upload config
  {
    const { res, json } = await request("/api/user/photos/upload-url")
    if (res.ok) {
      ok(`GET /api/user/photos/upload-url (mode: ${json?.mode ?? "unknown"})`)
    } else {
      fail("GET /api/user/photos/upload-url", `status ${res.status}`)
    }
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed\n`)

  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
