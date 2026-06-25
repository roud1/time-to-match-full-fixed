import { z } from "zod"

export const discoverSwipeBodySchema = z.object({
  targetUserId: z.string().uuid(),
  superLike: z.boolean().optional(),
})

export type DiscoverSwipeBody = z.infer<typeof discoverSwipeBodySchema>
