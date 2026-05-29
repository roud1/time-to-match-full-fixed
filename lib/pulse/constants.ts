/** Reserved profile id — not used by demo swipe cards. */
export const PULSE_PROFILE_ID = 900_001

export function isPulseProfileId(id: number): boolean {
  return id === PULSE_PROFILE_ID
}
