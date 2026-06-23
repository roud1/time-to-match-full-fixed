import {
  findLikeByEngineMatchIdForUser,
  findMatchByIdForUser,
} from "@/lib/server/repositories/likes"

/**
 * Client-facing `/api/matches/:id` uses **`likes.id`** as the canonical match id.
 * Engine state lives in `matches` and is linked via `likes.match_id`, created lazily
 * by `ensureEngineMatchForLike`. For backward compatibility, `:id` may also be an
 * engine `matches.id` — always normalize through `resolveMatchRouteId`.
 */
export type ResolvedMatchRouteId = {
  likeId: string
  engineMatchId: string | null
}

export function isValidMatchRouteId(id: string): boolean {
  const trimmed = id.trim()
  return trimmed.length > 0 && !trimmed.startsWith("local:")
}

/** Resolve route `:id` to the canonical likes.id for the current user. */
export async function resolveMatchRouteId(
  idParam: string,
  userId: string
): Promise<ResolvedMatchRouteId | null> {
  const trimmed = idParam.trim()
  if (!isValidMatchRouteId(trimmed)) return null

  const asLike = await findMatchByIdForUser(trimmed, userId)
  if (asLike) {
    return { likeId: asLike.id, engineMatchId: asLike.match_id ?? null }
  }

  const viaEngine = await findLikeByEngineMatchIdForUser(trimmed, userId)
  if (viaEngine) {
    return { likeId: viaEngine.id, engineMatchId: viaEngine.match_id ?? null }
  }

  return null
}
