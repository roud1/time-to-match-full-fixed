export type AchievementEvent =
  | "match_created"
  | "message_sent"
  | "bond_prolonged"
  | "freeze_used"
  | "profile_updated"

export type AchievementCheckContext = {
  event: AchievementEvent
  matchId?: string
  messageCount?: number
  prolongCount?: number
  activeMatchesCount?: number
  bondProlonged?: boolean
  at?: Date
}

export type DbAchievementRow = {
  id: string
  key: string
  title: string
  description: string
  icon: string
  category: string
  xp_reward: number
  freeze_reward: number
  created_at: Date
}

export type DbUserXpRow = {
  user_id: string
  xp: number
  level: number
  updated_at: Date
}

export type UnlockedAchievementDto = {
  key: string
  title: string
  description: string
  icon: string
  xpReward: number
  freezeReward: number
  unlockedAt: string
}

export type GamificationSnapshot = {
  xp: number
  level: number
  xpInLevel: number
  xpForNextLevel: number
  progress: number
  leveledUp: boolean
  unlocked: UnlockedAchievementDto[]
}

export type AchievementListItem = {
  key: string
  title: string
  description: string
  icon: string
  category: string
  xpReward: number
  freezeReward: number
  unlocked: boolean
  unlockedAt: string | null
  progressCurrent: number
  progressTarget: number
}
