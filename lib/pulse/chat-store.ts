import type { ChatMessage, ChatThread } from "@/lib/social-store"
import { PULSE_PROFILE_ID } from "@/lib/pulse/constants"

const STORAGE_KEY = "ttm-pulse-chat-v1"

type PulseChatState = {
  messages: ChatMessage[]
  welcomeSent: boolean
}

function load(): PulseChatState {
  if (typeof window === "undefined") return { messages: [], welcomeSent: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { messages: [], welcomeSent: false }
    const parsed = JSON.parse(raw) as Partial<PulseChatState>
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      welcomeSent: Boolean(parsed.welcomeSent),
    }
  } catch {
    return { messages: [], welcomeSent: false }
  }
}

function save(state: PulseChatState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent("ttm-pulse-chat-updated"))
  window.dispatchEvent(new CustomEvent("ttm-social-updated"))
}

function dispatch() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("ttm-pulse-chat-updated"))
  window.dispatchEvent(new CustomEvent("ttm-social-updated"))
}

export function getPulseThread(welcomeText: string): ChatThread {
  let state = load()
  if (!state.welcomeSent && state.messages.length === 0) {
    state = {
      welcomeSent: true,
      messages: [
        {
          id: `pulse-welcome-${Date.now()}`,
          from: "them",
          text: welcomeText,
          at: Date.now(),
        },
      ],
    }
    save(state)
  }
  const messages = state.messages
  const updatedAt = messages[messages.length - 1]?.at ?? Date.now()
  return { profileId: PULSE_PROFILE_ID, messages, updatedAt }
}

export function appendPulseMessage(from: "me" | "them", text: string): ChatThread {
  const state = load()
  const trimmed = text.trim()
  if (!trimmed) return getPulseThread("")
  const msg: ChatMessage = {
    id: `pulse-${Date.now()}-${from}`,
    from,
    text: trimmed,
    at: Date.now(),
  }
  const next = { ...state, messages: [...state.messages, msg] }
  save(next)
  return {
    profileId: PULSE_PROFILE_ID,
    messages: next.messages,
    updatedAt: msg.at,
  }
}

export function clearPulseChat() {
  save({ messages: [], welcomeSent: false })
}

export function subscribePulseChat(onUpdate: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = () => onUpdate()
  window.addEventListener("ttm-pulse-chat-updated", handler)
  return () => window.removeEventListener("ttm-pulse-chat-updated", handler)
}

export { dispatch as notifyPulseChat }
