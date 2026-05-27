import type { QueryClient } from "@tanstack/react-query"
import type { GamificationSnapshot } from "@/lib/gamification/types"
import { USER_QUERY_KEY } from "@/hooks/use-user"
import type { User } from "@/lib/user/types"
import { dispatchGamificationUpdate } from "@/lib/gamification/api"

export function applyGamificationSnapshot(
  qc: QueryClient,
  snapshot: GamificationSnapshot | null | undefined
) {
  if (!snapshot) return

  qc.setQueryData<User>(USER_QUERY_KEY, (prev) => {
    if (!prev) return prev
    return {
      ...prev,
      xp: snapshot.xp,
      level: snapshot.level,
      xpInLevel: snapshot.xpInLevel,
      xpForNextLevel: snapshot.xpForNextLevel,
      xpProgress: snapshot.progress,
    }
  })

  void qc.invalidateQueries({ queryKey: USER_QUERY_KEY })
  void qc.invalidateQueries({ queryKey: ["achievements"] })
  dispatchGamificationUpdate(snapshot)
}
