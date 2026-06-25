import {
  applyVisibilityCap,
  rankDiscoverProfiles,
} from "@/server/engines/ranking/ranking.service"
import { getBehaviorUser } from "@/server/engines/behavior/repository"
import { scoreCandidateProfiles } from "@/server/matching/compatibility"
import {
  buildCandidateProfiles,
  getViewerInterestIds,
  touchUserActivity,
} from "@/server/matching/repository"
import type {
  DiscoverFeedOptions,
  DiscoverFeedProfile,
  LikeResult,
  PassResult,
  UserProfile,
} from "@/server/matching/types"
import { canUserLike, consumeLike } from "@/server/monetization"
import { canUserSuperLike, consumeSuperLike } from "@/server/monetization/super-like.service"
import { getDb } from "@/server/db"
import { recordLikeForUser, recordPassForUser } from "@/server/repositories/likes"
import { findUserById } from "@/server/repositories/users"

async function buildViewerProfile(
  viewerId: string,
  viewerLat?: number | null,
  viewerLng?: number | null
): Promise<UserProfile | null> {
  const user = await findUserById(viewerId)
  if (!user) return null

  const interestIds = await getViewerInterestIds(viewerId)
  const profile = user.profile ?? {}
  const birthdate =
    typeof profile.birthdate === "string" && profile.birthdate.trim()
      ? profile.birthdate.trim()
      : null

  let age = 25
  if (birthdate) {
    const birth = new Date(birthdate)
    if (!Number.isNaN(birth.getTime())) {
      const today = new Date()
      age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    }
  }

  const lat =
    viewerLat != null && Number.isFinite(viewerLat) ? viewerLat : user.latitude
  const lng =
    viewerLng != null && Number.isFinite(viewerLng) ? viewerLng : user.longitude

  const behavior = await getBehaviorUser(viewerId)

  return {
    id: viewerId,
    age,
    interestIds,
    latitude: lat,
    longitude: lng,
    ageMin: user.age_min,
    ageMax: user.age_max,
    maxDistance: user.max_distance,
    profileCompleteness: 0.7,
    activitySignal: behavior?.activity_score ?? 0.5,
  }
}

async function hasPriorLike(actorId: string, targetUserId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const rows = await db<{ n: number }[]>`
    SELECT 1 AS n FROM likes
    WHERE from_user = ${actorId} AND to_user = ${targetUserId}
    LIMIT 1
  `
  return rows.length > 0
}

export async function recordLike(
  actorId: string,
  targetUserId: string,
  options?: { superLike?: boolean }
): Promise<LikeResult> {
  if (options?.superLike) {
    const superAccess = await canUserSuperLike(actorId)
    if (!superAccess.allowed) {
      return {
        ok: false,
        code: "super_like_limit_reached",
        remaining: superAccess.remaining,
      }
    }
  }

  const hadPrior = await hasPriorLike(actorId, targetUserId)
  if (!hadPrior) {
    const access = await canUserLike(actorId)
    if (!access.allowed) {
      return {
        ok: false,
        code: "like_limit_reached",
        remaining: access.remaining,
      }
    }
  }

  const result = await recordLikeForUser(actorId, targetUserId, {
    isSuper: options?.superLike,
  })
  if (result.ok) {
    if (!hadPrior) {
      await consumeLike(actorId)
    }
    if (options?.superLike) {
      await consumeSuperLike(actorId)
    }
    await touchUserActivity(actorId)
  }
  return result
}

export async function recordPass(actorId: string, targetUserId: string): Promise<PassResult> {
  const result = await recordPassForUser(actorId, targetUserId)
  if (result.ok) {
    await touchUserActivity(actorId)
  }
  return result
}

export async function getDiscoverFeed(options: DiscoverFeedOptions): Promise<DiscoverFeedProfile[]> {
  const viewer = await buildViewerProfile(
    options.viewerId,
    options.viewerLat,
    options.viewerLng
  )
  if (!viewer) return []

  const candidates = await buildCandidateProfiles({
    viewerId: options.viewerId,
    filters: options.filters,
    viewerLat: options.viewerLat,
    viewerLng: options.viewerLng,
    cursor: options.cursor,
    limit: options.limit,
  })

  if (candidates.length === 0) return []

  const scored = scoreCandidateProfiles(viewer, candidates)

  const ranked = await rankDiscoverProfiles({
    viewerId: options.viewerId,
    profiles: scored.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      bio: p.bio,
      location: p.location,
      distanceKm: p.distanceKm,
      image: p.image,
      images: p.images,
      interests: p.interests,
      lat: p.lat,
      lng: p.lng,
      purpose: p.purpose,
      compatibility: p.compatibilityScore,
      commonInterests: p.commonInterests,
      photoVerified: p.photoVerified,
    })),
  })

  const behavior = await getBehaviorUser(options.viewerId)
  const capped = applyVisibilityCap(ranked, behavior?.discover_visibility ?? 1)

  return capped.flatMap((p) => {
    const source = scored.find((s) => s.id === p.id)
    if (!source) return []
    return [
      {
        ...source,
        compatibilityScore: source.compatibilityScore,
        compatibilityBreakdown: source.compatibilityBreakdown,
        compatibility: source.compatibilityScore,
        rankingScore: p.rankingScore,
        candidateTier: p.candidateTier,
      },
    ]
  })
}

/** Matching service singleton for API handlers. */
export const matchingService = {
  recordLike,
  recordPass,
  getDiscoverFeed,
}
