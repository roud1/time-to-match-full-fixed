import { z } from "zod"

const messageSchema = z.object({
  from: z.enum(["me", "them"]),
  text: z.string().max(2000),
  at: z.number().int().positive(),
})

const signalsSchema = z.object({
  avgReplyMs: z.number().nullable(),
  medianReplyMs: z.number().nullable(),
  replyConsistency: z.number().min(0).max(1),
  avgMessageLength: z.number().min(0).max(5000),
  interactionDepth: z.number().min(0).max(100),
  mutualEngagement: z.number().min(0).max(1),
  lateNightRatio: z.number().min(0).max(1),
  dailyConsistency: z.number().min(0).max(1),
  emotionalIntensity: z.number().min(0).max(100),
  oneSidedRatio: z.number().min(0).max(1),
  sessionDepth: z.number().min(0).max(500),
  fastReplyCount: z.number().min(0).max(100),
  messageCount: z.number().min(0).max(10_000),
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
  signals: signalsSchema.optional(),
})

export type AnalyzeConnectionBody = z.infer<typeof analyzeConnectionBodySchema>

const chemistrySchema = z.enum(["low", "medium", "high", "peak", "intense"])
const bondSchema = z.enum(["forming", "growing", "stable", "deep"])
const energySchema = z.enum(["growing", "steady", "cooling", "fading"])
const emotionalStateSchema = z.enum([
  "curious",
  "warming",
  "deepening",
  "aligned",
  "tension",
  "distant",
  "fading",
])
const connectionStateSchema = z.enum([
  "growing_connection",
  "stable_bond",
  "deep_chemistry",
  "emotional_tension",
  "fading_energy",
  "high_compatibility",
])
const personalitySchema = z.enum([
  "slow_burn",
  "deep_sync",
  "emotional_chaos",
  "calm_connection",
  "magnetic_chemistry",
  "night_energy",
  "stable_bond",
  "intense_attraction",
  "intense_chemistry",
  "deep_compatibility",
])

const memorySchema = z.object({
  id: z.enum(["first_deep_talk", "long_night", "high_interaction", "strong_chemistry"]),
  at: z.number().int().positive(),
  label: z.string().max(120),
  importance: z.number().min(0).max(1),
})

export const connectionAIAnalysisSchema = z.object({
  sync: z.number().min(0).max(100),
  chemistry: chemistrySchema,
  bond: bondSchema,
  energy: energySchema,
  emotionalState: emotionalStateSchema,
  connectionState: connectionStateSchema,
  personality: personalitySchema,
  insight: z.string().min(4).max(280),
  atmosphereLevel: z.number().min(0).max(100).optional(),
  memories: z.array(memorySchema).max(6).optional(),
})

export type ConnectionAIAnalysisPayload = z.infer<typeof connectionAIAnalysisSchema>
