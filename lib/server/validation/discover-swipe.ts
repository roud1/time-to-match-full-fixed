import { z } from "zod"

export const discoverSwipeBodySchema = z.object({
  targetUserId: z.string().uuid(),
})

export type DiscoverSwipeBody = z.infer<typeof discoverSwipeBodySchema>
