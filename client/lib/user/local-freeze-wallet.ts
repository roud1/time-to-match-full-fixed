const BALANCE_KEY = "ttm-freeze-balance"
const LAST_FREEZE_KEY = "ttm-last-freeze-at"

export function getLocalFreezeBalance(): number {
  if (typeof window === "undefined") return 0
  const raw = localStorage.getItem(BALANCE_KEY)
  const n = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function setLocalFreezeBalance(balance: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(BALANCE_KEY, String(Math.max(0, balance)))
}

export function addLocalFreezeBalance(delta: number): number {
  const next = getLocalFreezeBalance() + delta
  setLocalFreezeBalance(next)
  return next
}

export function getLocalLastFreezeAt(): string | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(LAST_FREEZE_KEY)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? new Date(n).toISOString() : null
}

export function setLocalLastFreezeAt(iso: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_FREEZE_KEY, String(new Date(iso).getTime()))
}
