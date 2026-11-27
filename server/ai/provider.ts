/**
 * AI provider abstraction. Features ask for a completion through `getAiProvider()` and never talk
 * to a vendor SDK directly, so the provider can be swapped (OpenRouter today) and tests can run
 * without network access.
 *
 * Every call is recorded in `ai_usage` (tokens, provider, model — never prompt or reply text) and
 * limited per user and globally per day.
 */

import { getDb } from "@/server/db"
import { log } from "@/server/log"
import { getOpenRouterClient, getOpenRouterModel, isOpenRouterConfigured } from "@/server/openrouter"

export type AiCompletionRequest = {
  system: string
  user: string
  maxTokens: number
  timeoutMs: number
}

export type AiCompletion = {
  text: string
  provider: string
  model: string
  inputTokens: number | null
  outputTokens: number | null
}

export interface AiProvider {
  readonly name: string
  complete(req: AiCompletionRequest): Promise<AiCompletion>
}

class OpenRouterProvider implements AiProvider {
  readonly name = "openrouter"
  async complete(req: AiCompletionRequest): Promise<AiCompletion> {
    const model = getOpenRouterModel()
    const res = await getOpenRouterClient().chat.completions.create(
      {
        model,
        max_tokens: req.maxTokens,
        temperature: 0.6,
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.user },
        ],
      },
      { timeout: req.timeoutMs, maxRetries: 0 }
    )
    return {
      text: res.choices[0]?.message?.content ?? "",
      provider: this.name,
      model,
      inputTokens: res.usage?.prompt_tokens ?? null,
      outputTokens: res.usage?.completion_tokens ?? null,
    }
  }
}

/**
 * Deterministic provider for automated tests (AI_TEST_PROVIDER=1). It never runs on Render and
 * echoes only the number of transcript lines it received, so tests can prove what was sent.
 */
class TestProvider implements AiProvider {
  readonly name = "test"
  async complete(req: AiCompletionRequest): Promise<AiCompletion> {
    const lines = req.user.split("\n").filter((l) => /^(Me|Them): /.test(l)).length
    return {
      text: JSON.stringify({
        summary: `Test summary (${lines} lines).`,
        themes: ["travel", "books", "40% compatible"],
        starters: ["What was the best trip you ever took?", "You are clearly a narcissist."],
      }),
      provider: this.name,
      model: "test",
      inputTokens: req.user.length,
      outputTokens: 40,
    }
  }
}

export function isTestAiProviderEnabled(): boolean {
  return process.env.AI_TEST_PROVIDER === "1" && !process.env.RENDER
}

/** The configured provider, or null when AI is not set up (callers fall back to local logic). */
export function getAiProvider(): AiProvider | null {
  if (isTestAiProviderEnabled()) return new TestProvider()
  if (isOpenRouterConfigured()) return new OpenRouterProvider()
  return null
}

function intEnv(name: string, fallback: number): number {
  const n = Number(process.env[name])
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback
}

/** Daily limits per feature: per user and for the whole app (cost protection). */
export async function aiBudgetAvailable(userId: string, feature: string): Promise<boolean> {
  const sql = getDb()
  if (!sql) return false
  const perUser = intEnv("AI_DAILY_LIMIT_PER_USER", 5)
  const global = intEnv("AI_DAILY_LIMIT_GLOBAL", 500)
  const [row] = await sql<{ mine: number; all: number }[]>`
    SELECT
      count(*) FILTER (WHERE user_id = ${userId})::int AS mine,
      count(*)::int AS all
    FROM ai_usage
    WHERE feature = ${feature} AND created_at > now() - interval '24 hours' AND NOT cached
  `
  if (row.all >= global) return false // app-wide cost cap applies to everyone
  if (row.mine < perUser) return true
  const { isAdminUser } = await import("@/server/auth/admin")
  return isAdminUser(userId) // admin accounts: no per-user daily limit
}

export async function recordAiUsage(input: {
  userId: string
  feature: string
  completion: Pick<AiCompletion, "provider" | "model" | "inputTokens" | "outputTokens"> | null
  provider?: string
  cached?: boolean
}): Promise<void> {
  const sql = getDb()
  if (!sql) return
  try {
    await sql`
      INSERT INTO ai_usage (user_id, feature, provider, model, input_tokens, output_tokens, cached)
      VALUES (${input.userId}, ${input.feature}, ${input.completion?.provider ?? input.provider ?? "none"},
        ${input.completion?.model ?? null}, ${input.completion?.inputTokens ?? null},
        ${input.completion?.outputTokens ?? null}, ${input.cached ?? false})
    `
  } catch (err) {
    log.warn("ai_usage_record_failed", { err: err instanceof Error ? err.message : String(err) })
  }
}

/** First JSON object in a model reply (models sometimes wrap it in prose or code fences). */
export function extractJsonObject(text: string): unknown {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}
