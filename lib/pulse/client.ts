import type { ChatMessage } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"

export async function fetchPulseReply(
  messages: ChatMessage[],
  locale: Locale
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const history = messages
    .filter((m) => m.from === "me" || m.from === "them")
    .slice(-24)
    .map((m) => ({
      role: m.from === "me" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }))

  try {
    const res = await fetch("/api/pulse/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, locale }),
    })
    const data = (await res.json()) as { reply?: string; error?: string }
    if (!res.ok || !data.reply?.trim()) {
      return { ok: false, error: data.error ?? "pulse_failed" }
    }
    return { ok: true, text: data.reply.trim() }
  } catch {
    return { ok: false, error: "network" }
  }
}
