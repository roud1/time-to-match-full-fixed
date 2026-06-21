import { z } from "zod"

export const matchMessageBodySchema = z.object({
  text: z.string().trim().min(1).max(8000),
})

export type MatchMessageBody = z.infer<typeof matchMessageBodySchema>
