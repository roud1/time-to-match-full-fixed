/** Deterministic demo signals for peer profiles (no server). */

export type PeerTrustSignals = {
  /** 0–100 authenticity / completeness hint */
  score: number
  /** Demo “photo verified” cohort */
  photoVerified: boolean
  /** Subtle moderation-pipeline hint — never punitive copy */
  reviewSurface: boolean
}

export function getPeerTrustSignals(profileId: number): PeerTrustSignals {
  const photoVerified = profileId % 4 !== 0
  const reviewSurface = profileId % 11 === 3
  const base = 58 + (profileId * 17) % 38
  const score = reviewSurface ? Math.min(base, 74) : base + (photoVerified ? 6 : 0)
  return {
    score: Math.min(98, score),
    photoVerified,
    reviewSurface,
  }
}

/** Combined trust for the signed-in user’s profile card (demo blend). */
export function getOwnTrustPresentation(
  profileStrength: number,
  emailDone: boolean,
  photoStatus: "none" | "pending" | "verified"
) {
  let bonus = 0
  if (emailDone) bonus += 8
  if (photoStatus === "pending") bonus += 4
  if (photoStatus === "verified") bonus += 14
  return Math.min(100, Math.round(profileStrength * 0.72 + bonus))
}
