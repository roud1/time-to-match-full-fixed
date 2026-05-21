import type { ChatMessage } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"

export function threadToPulseMessages(
  messages: ChatMessage[]
): { role: "user" | "assistant"; content: string }[] {
  return messages.map((m) => ({
    role: m.from === "me" ? "user" : "assistant",
    content: m.text,
  }))
}

const BANNED_REPLY_RE = /понимаю\.?\s*развивай\s+мысль/i

export async function fetchPulseReply(
  locale: Locale,
  messages: ChatMessage[],
  userName?: string
): Promise<{ reply: string }> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 22_000)
  try {
    const res = await fetch("/api/v1/chat/pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        userName,
        messages: threadToPulseMessages(messages),
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error("pulse_request_failed")
    }
    const data = (await res.json()) as { reply: string }
    const reply = data.reply?.trim() ?? ""
    if (!reply || BANNED_REPLY_RE.test(reply)) {
      throw new Error("pulse_reply_invalid")
    }
    return { reply }
  } finally {
    window.clearTimeout(timeout)
  }
}
