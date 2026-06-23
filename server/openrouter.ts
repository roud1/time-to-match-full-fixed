import OpenAI from "openai"

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
export const OPENROUTER_MODEL = "openai/gpt-oss-120b:free"

let client: OpenAI | null = null

export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY?.trim()
  return Boolean(key && key.length > 8)
}

export function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured")
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENROUTER_BASE_URL?.trim() || OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://timetomatch.app",
        "X-Title": "Time to Match",
      },
    })
  }
  return client
}

export function getOpenRouterModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || OPENROUTER_MODEL
}
