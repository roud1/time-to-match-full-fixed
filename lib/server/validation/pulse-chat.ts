import { z } from "zod"

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
})

export const pulseChatBodySchema = z.object({
  locale: z.enum(["ru", "uk", "en"]).optional().default("en"),
  userName: z.string().max(80).optional(),
  messages: z.array(messageSchema).max(40),
})

export type PulseChatBody = z.infer<typeof pulseChatBodySchema>
