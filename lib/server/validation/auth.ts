import { z } from "zod"

export const registerBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
})

export const loginBodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
})

export function sanitizeDisplayName(raw: string) {
  return raw.replace(/[<>]/g, "").trim()
}
