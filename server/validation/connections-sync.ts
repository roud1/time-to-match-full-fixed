import { z } from "zod"

export const connectionSyncBodySchema = z.object({
  version: z.number().int().min(1).max(10).default(1),
  connections: z.array(z.record(z.unknown())).max(200),
  memories: z.array(z.record(z.unknown())).max(100),
  recentEvents: z.array(z.record(z.unknown())).max(20).optional(),
})
