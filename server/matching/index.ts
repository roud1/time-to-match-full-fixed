export { matchingService, recordLike, recordPass, getDiscoverFeed } from "@/server/matching/matching.service"
export {
  computeCompatibility,
  rankCandidates,
  scoreInterests,
  scoreAge,
  scoreGeo,
  scoreActivity,
} from "@/server/matching/compatibility"
export type {
  UserProfile,
  CompatibilityScore,
  CompatibilityBreakdown,
  CandidateProfile,
  ScoredCandidate,
  DiscoverFeedProfile,
  LikeResult,
  PassResult,
  DiscoverFeedOptions,
} from "@/server/matching/types"
