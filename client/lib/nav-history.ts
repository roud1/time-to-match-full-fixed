/**
 * In-app back navigation that never leaves Luvia.
 *
 * `history.length` also counts pages visited before the app (a search result, the link in a
 * notification), so "history.length > 1 → back" could take people out of the PWA. Instead we
 * count the navigations made inside the app in this tab (sessionStorage, survives a reload).
 */
const KEY = "ttm-nav-depth"

export function getNavDepth(): number {
  try {
    const n = Number(sessionStorage.getItem(KEY))
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

export function setNavDepth(n: number): void {
  try {
    sessionStorage.setItem(KEY, String(Math.max(0, Math.floor(n))))
  } catch {
    /* storage blocked */
  }
}

/** True when going back stays inside the app. */
export function canGoBackInApp(): boolean {
  return getNavDepth() > 0
}

/** Back within the app, or to `fallback` (default: the feed) when there is no in-app history. */
export function safeBack(router: { back: () => void; replace: (href: string) => void }, fallback = "/app"): void {
  if (canGoBackInApp()) router.back()
  else router.replace(fallback)
}
