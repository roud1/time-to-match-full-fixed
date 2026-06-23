const INVITE_KEY = "ttm-invite-code"

export type InvitePayload = {
  code: string
  url: string
  message: string
}

function randomCode(): string {
  const part = () => Math.random().toString(36).slice(2, 6)
  return `${part()}${part()}`.toUpperCase()
}

export function getOrCreateInviteCode(): string {
  if (typeof window === "undefined") return "DEMO"
  let code = localStorage.getItem(INVITE_KEY)
  if (!code) {
    code = randomCode()
    localStorage.setItem(INVITE_KEY, code)
  }
  return code
}

export function buildInvitePayload(baseUrl?: string): InvitePayload {
  const origin =
    baseUrl ??
    (typeof window !== "undefined" ? window.location.origin : "https://timetomatch.app")
  const code = getOrCreateInviteCode()
  const url = `${origin}/welcome?invite=${code}`
  const message = `Time to Match — a living emotional space for real connection.\nJoin my world: ${url}`
  return { code, url, message }
}

export async function copyInviteLink(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false
  try {
    await navigator.clipboard.writeText(buildInvitePayload().url)
    return true
  } catch {
    return false
  }
}

export async function shareInviteNative(): Promise<boolean> {
  const payload = buildInvitePayload()
  if (typeof navigator === "undefined" || !navigator.share) return false
  try {
    await navigator.share({
      title: "Time to Match",
      text: payload.message,
      url: payload.url,
    })
    return true
  } catch {
    return false
  }
}
