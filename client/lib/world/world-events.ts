/**
 * Client realtime bus — today: CustomEvents + ticks.
 * Future: WebSocket fan-out (see lib/server/realtime.ts).
 */

export type WorldPulseReason =
  | "connection"
  | "social"
  | "sync"
  | "atmosphere"
  | "presence"

const WORLD_EVENT = "ttm-world-pulse"

export function emitWorldPulse(reason: WorldPulseReason) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(WORLD_EVENT, { detail: { reason, at: Date.now() } })
  )
}

export function subscribeWorldPulse(handler: (reason: WorldPulseReason) => void): () => void {
  if (typeof window === "undefined") return () => {}

  const onWorld = (e: Event) => {
    const detail = (e as CustomEvent<{ reason?: WorldPulseReason }>).detail
    handler(detail?.reason ?? "connection")
  }

  const onConnection = () => handler("connection")

  const onSocial = () => handler("social")

  window.addEventListener(WORLD_EVENT, onWorld)
  window.addEventListener("ttm-connection-updated", onConnection)
  window.addEventListener("ttm-social-updated", onSocial)

  return () => {
    window.removeEventListener(WORLD_EVENT, onWorld)
    window.removeEventListener("ttm-connection-updated", onConnection)
    window.removeEventListener("ttm-social-updated", onSocial)
  }
}
