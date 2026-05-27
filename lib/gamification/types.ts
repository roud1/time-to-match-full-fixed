export type UnlockedAchievement = {
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
  unlocked: UnlockedAchievement[]
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
