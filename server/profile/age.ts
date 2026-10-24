/** Whole years between a YYYY-MM-DD birth date and `now` (UTC). Returns null for invalid dates. */
export function ageFromBirthDate(birthDate: string, now: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const parsed = new Date(Date.UTC(y, mo - 1, d))
  if (parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== mo - 1 || parsed.getUTCDate() !== d) return null
  let age = now.getUTCFullYear() - y
  const monthDiff = now.getUTCMonth() - (mo - 1)
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < d)) age--
  return age
}

export const MIN_AGE = 18

/** True only for a valid date that is at least MIN_AGE years ago (and not in the future). */
export function isAdultBirthDate(birthDate: string, now: Date = new Date()): boolean {
  const age = ageFromBirthDate(birthDate, now)
  return age !== null && age >= MIN_AGE && age <= 120
}
