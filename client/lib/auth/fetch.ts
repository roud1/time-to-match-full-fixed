/**
 * Fetch wrapper: on 401, attempts POST /api/v1/auth/refresh then retries once.
 * Use for credentialed API calls in production mode.
 */
let refreshInFlight: Promise<boolean> | null = null

async function tryRefreshSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    return res.ok
  } catch {
    return false
  }
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const opts: RequestInit = { ...init, credentials: init?.credentials ?? "include" }
  let res = await fetch(input, opts)

  if (res.status !== 401) return res

  if (!refreshInFlight) {
    refreshInFlight = tryRefreshSession().finally(() => {
      refreshInFlight = null
    })
  }

  if (await refreshInFlight) {
    res = await fetch(input, opts)
  }

  return res
}
