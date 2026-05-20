import type { Locale } from "@/lib/i18n"
import type { ChatMessage } from "@/lib/social-store"

export type PulseAiSource = "openai" | "local"

export function chatMessagesToPulseHistory(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.from === "me" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }))
}

export async function fetchPulseReply(
  locale: Locale,
  messages: ChatMessage[],
  userName?: string
): Promise<{ reply: string; source: PulseAiSource }> {
  const history = chatMessagesToPulseHistory(messages)

  const res = await fetch("/api/v1/chat/pulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locale,
      messages: history,
      ...(userName?.trim() ? { userName: userName.trim() } : {}),
    }),
  })

  if (!res.ok) {
    throw new Error(`pulse_ai_${res.status}`)
  }

  const data = (await res.json()) as { reply: string; source?: PulseAiSource }
  return { reply: data.reply, source: data.source ?? "local" }
}
