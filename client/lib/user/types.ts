import type { AchievementListItem, UnlockedAchievement } from "@/client/lib/gamification/types"
import type { Interest } from "@/client/lib/interests/types"
import type { ProfileLocation, ProfilePhoto } from "@/client/lib/profile/api"

export type User = {
  id: string
  email: string
  name: string
  freeze_balance: number
  last_freeze_at: string | null
  email_verified: boolean
  photo_verified?: boolean
  has_push_subscription: boolean
  profileExpiresAt?: string | null
  purpose?: string | null
  gender?: "male" | "female" | null
  ageMin?: number | null
  ageMax?: number | null
  latitude?: number | null
  longitude?: number | null
  maxDistance?: number
  bio?: string | null
  birthDate?: string | null
  age?: number | null
  photos?: ProfilePhoto[]
  location?: ProfileLocation | null
  interests?: Interest[]
  interestIds?: number[]
  xp?: number
  level?: number
  xpInLevel?: number
  xpForNextLevel?: number
  xpProgress?: number
  achievements?: UnlockedAchievement[]
  achievementCatalog?: AchievementListItem[]
}

export type MeResponse = {
  user: User
}

export type BuyFreezesResponse = {
  success: true
  newBalance: number
}
