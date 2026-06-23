import { MATCH_TTL_MS } from "@/client/lib/expiry"

export { MATCH_TTL_MS }

export function matchExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + MATCH_TTL_MS)
}

/** Order user ids for matches.user1_id < user2_id constraint. */
export function orderedPair(userA: string, userB: string): { user1Id: string; user2Id: string } {
  return userA < userB
    ? { user1Id: userA, user2Id: userB }
    : { user1Id: userB, user2Id: userA }
}

export function isUser1(userId: string, user1Id: string, user2Id: string): boolean {
  return userId === user1Id
}
