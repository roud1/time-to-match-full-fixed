/**
 * Build an absolute URL on the PUBLIC origin of the site.
 *
 * Behind a proxy (Render, Vercel, Docker) a standalone Next server is bound to HOSTNAME=0.0.0.0, so
 * `new URL(path, request.url)` yields http://0.0.0.0:PORT/... and redirects send the browser there.
 * Prefer the forwarded/Host headers, then NEXT_PUBLIC_APP_URL, and only then request.url.
 * Edge-runtime safe (no Node APIs).
 */
export function publicUrl(request: Request, path: string): URL {
  const headers = request.headers
  const first = (value: string | null) => value?.split(",")[0]?.trim() || null
  const host = first(headers.get("x-forwarded-host")) ?? first(headers.get("host"))
  const isInternalHost = !host || host.startsWith("0.0.0.0") || host.startsWith("[::]")

  if (!isInternalHost) {
    let proto = first(headers.get("x-forwarded-proto"))
    if (!proto) {
      try {
        proto = new URL(request.url).protocol.replace(":", "")
      } catch {
        proto = "https"
      }
    }
    try {
      return new URL(path, `${proto}://${host}`)
    } catch {
      /* fall through */
    }
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) {
    try {
      return new URL(path, configured)
    } catch {
      /* fall through */
    }
  }
  return new URL(path, request.url)
}
