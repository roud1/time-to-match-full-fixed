/** ISO date string `YYYY-MM-DD` ↔ local Date (no timezone drift). */
export function parseIsoDate(iso: string): Date | undefined {
  if (!iso) return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return undefined
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return date
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getBirthdateBounds() {
  const maxDate = new Date()
  maxDate.setHours(12, 0, 0, 0)
  maxDate.setFullYear(maxDate.getFullYear() - 18)

  const minDate = new Date()
  minDate.setHours(12, 0, 0, 0)
  minDate.setFullYear(minDate.getFullYear() - 100)

  return { minDate, maxDate }
}

export function getAgeFromIsoDate(iso: string): number | null {
  const birth = parseIsoDate(iso)
  if (!birth) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

export type BirthdateInputOrder = "dmy" | "mdy"

export function getBirthdateInputOrder(locale: string): BirthdateInputOrder {
  return locale === "en" ? "mdy" : "dmy"
}

export function isoToDisplayText(iso: string, order: BirthdateInputOrder): string {
  const date = parseIsoDate(iso)
  if (!date) return ""
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = String(date.getFullYear())
  const sep = order === "mdy" ? "/" : "."
  return order === "mdy" ? `${m}${sep}${d}${sep}${y}` : `${d}${sep}${m}${sep}${y}`
}

/** Auto-format while typing (digits only, max 8). */
export function formatBirthdateDigits(digits: string, order: BirthdateInputOrder): string {
  const d = digits.replace(/\D/g, "").slice(0, 8)
  const sep = order === "mdy" ? "/" : "."

  if (order === "mdy") {
    if (d.length <= 2) return d
    if (d.length <= 4) return `${d.slice(0, 2)}${sep}${d.slice(2)}`
    return `${d.slice(0, 2)}${sep}${d.slice(2, 4)}${sep}${d.slice(4)}`
  }

  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}${sep}${d.slice(2)}`
  return `${d.slice(0, 2)}${sep}${d.slice(2, 4)}${sep}${d.slice(4)}`
}

function buildLocalDate(day: number, month: number, year: number): Date | undefined {
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined
  }
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return date
}

/** Parses manual input: DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD, etc. */
export function parseManualBirthdate(text: string, order: BirthdateInputOrder): Date | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined

  const iso = parseIsoDate(trimmed)
  if (iso) return iso

  const dotted = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed)
  if (dotted) {
    const a = Number(dotted[1])
    const b = Number(dotted[2])
    const year = Number(dotted[3])
    const [day, month] = order === "mdy" ? [b, a] : [a, b]
    return buildLocalDate(day, month, year)
  }

  const digits = trimmed.replace(/\D/g, "")
  if (digits.length === 8) {
    const p1 = Number(digits.slice(0, 2))
    const p2 = Number(digits.slice(2, 4))
    const year = Number(digits.slice(4, 8))
    const [day, month] = order === "mdy" ? [p2, p1] : [p1, p2]
    return buildLocalDate(day, month, year)
  }

  return undefined
}

export function isWithinBirthdateBounds(date: Date, minDate: Date, maxDate: Date): boolean {
  const t = date.getTime()
  return t >= minDate.getTime() && t <= maxDate.getTime()
}
