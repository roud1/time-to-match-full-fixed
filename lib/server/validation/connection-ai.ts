import { z } from "zod"

const messageSchema = z.object({
  from: z.enum(["me", "them"]),
  text: z.string().max(2000),
  at: z.number().int().positive(),
})

export const analyzeConnectionBodySchema = z.object({
  profileId: z.number().int().positive(),
  locale: z.enum(["ru", "uk", "en"]).optional().default("en"),
  messages: z.array(messageSchema).max(40),
  responseTimes: z.array(z.number().min(0)).max(40),
  activityLevel: z.enum(["low", "medium", "high"]),
  conversationLength: z.number().int().min(0).max(10_000),
  mutualInteraction: z.boolean(),
  lateNightActivity: z.boolean(),
  stage: z.string().max(32).optional(),
  streakDays: z.number().int().min(0).max(365).optional(),
})

export type AnalyzeConnectionBody = z.infer<typeof analyzeConnectionBodySchema>

const chemistrySchema = z.enum(["low", "medium", "high", "peak"])
const bondSchema = z.enum(["forming", "growing", "stable", "deep"])
const energySchema = z.enum(["growing", "steady", "cooling", "fading"])

export const connectionAIAnalysisSchema = z.object({
  sync: z.number().min(0).max(100),
  chemistry: chemistrySchema,
  bond: bondSchema,
  energy: energySchema,
  insight: z.string().min(4).max(280),
})

/** @deprecated use connectionAIAnalysisSchema */
export const deepSeekAnalysisSchema = connectionAIAnalysisSchema

export type ConnectionAIAnalysisPayload = z.infer<typeof connectionAIAnalysisSchema>
/** @deprecated */
export type DeepSeekAnalysisPayload = ConnectionAIAnalysisPayload
