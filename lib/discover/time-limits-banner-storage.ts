const KEY = "ttm-discover-time-limits-dismissed"

export function isDiscoverTimeLimitsBannerDismissed(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(KEY) === "1"
}

export function dismissDiscoverTimeLimitsBanner(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, "1")
}
