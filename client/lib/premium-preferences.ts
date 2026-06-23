const INVISIBLE_KEY = "ttm-premium-invisible"

export function getInvisibleMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(INVISIBLE_KEY) === "1"
}

export function setInvisibleMode(on: boolean) {
  if (typeof window === "undefined") return
  if (on) localStorage.setItem(INVISIBLE_KEY, "1")
  else localStorage.removeItem(INVISIBLE_KEY)
  window.dispatchEvent(new CustomEvent("ttm-premium-preferences-changed"))
}
