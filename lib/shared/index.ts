/**
 * Shared logic — importable from Next.js or future Expo / React Native app.
 * Keep modules free of React and browser-only APIs where possible.
 */
export {
  type RelationshipLiveState,
  type RelationshipStateTokens,
  deriveLiveRelationshipState,
  getRelationshipStateTokens,
  relationshipStateDataAttrs,
} from "@/lib/shared/relationship-live-state"

export {
  type DailyReturnInsight,
  type DailyReturnInsightKind,
  recordDailyVisit,
  computeDailyReturnInsights,
  shouldShowDailyReturn,
} from "@/lib/shared/daily-return"

export {
  type EmotionalNotification,
  type EmotionalNotificationKind,
  buildEmotionalNotifications,
} from "@/lib/shared/emotional-notifications"

export {
  type ShareMoment,
  type ShareMomentKind,
  buildSyncShareMoment,
  shareMomentToText,
  shareMomentNative,
  copyShareMoment,
} from "@/lib/shared/share-moments"

export {
  type RelationshipInsight,
  type RelationshipPatternId,
  analyzeRelationshipPatterns,
} from "@/lib/shared/relationship-insights"
