import { NextResponse } from "next/server"
import {
  getOpenRouterClient,
  getOpenRouterModel,
  isOpenRouterConfigured,
} from "@/server/openrouter"
import { pickLocalPulseReply } from "@/client/lib/pulse/local-replies"
import type { Locale } from "@/client/lib/i18n"

type Body = {
  messages?: { role: "user" | "assistant"; content: string }[]
  locale?: Locale
}

const SYSTEM = `You are Pulse, the warm AI guide inside the dating app "Time to Match".
You help users with: conversation openers, keeping chats respectful and alive, emotional tone, and match timing.
Reply in the user's language (locale hint). Keep answers concise (2-4 short paragraphs max), practical, never preachy.
Do not pretend to be a real human match. Do not give medical or legal advice.`

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const messages = body.messages?.filter((m) => m.content?.trim()) ?? []
  const locale = body.locale ?? "ru"
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? ""

  if (!lastUser.trim()) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 })
  }

  if (!isOpenRouterConfigured()) {
    return NextResponse.json({ reply: pickLocalPulseReply(locale, lastUser) })
  }

  try {
    const client = getOpenRouterClient()
    const completion = await client.chat.completions.create({
      model: getOpenRouterModel(),
      temperature: 0.75,
      max_tokens: 480,
      messages: [
        { role: "system", content: SYSTEM },
        ...messages.slice(-20).map((m) => ({
          role: m.role,
          content: m.content.trim(),
        })),
      ],
    })
    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json({ reply: pickLocalPulseReply(locale, lastUser) })
    }
    return NextResponse.json({ reply })
  } catch (err) {
    console.error("[pulse/chat]", err)
    return NextResponse.json({ reply: pickLocalPulseReply(locale, lastUser) })
  }
}
