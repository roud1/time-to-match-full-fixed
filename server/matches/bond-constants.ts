export const BOND_MESSAGES_PER_PROLONG = 5
export const BOND_PROLONG_HOURS = 6
export const BOND_PROLONG_COOLDOWN_MS = 60 * 60 * 1000

/** Messages remaining until the next automatic +6h prolong (every 50 messages). */
export function messagesUntilNextFromTotal(totalMessages: number): number {
  if (totalMessages <= 0) return BOND_MESSAGES_PER_PROLONG
  const rem = totalMessages % BOND_MESSAGES_PER_PROLONG
  if (rem === 0) return 0
  return BOND_MESSAGES_PER_PROLONG - rem
}
