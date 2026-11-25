/**
 * Android app push (Firebase via @capacitor/push-notifications). Only active in an APK built with
 * Firebase config — that build adds "TTMPush" to the user agent (mobile/capacitor.config.js);
 * calling the plugin without Firebase config would crash the app, so it is never touched then.
 */

import { currentUiLocale } from "@/client/lib/push-subscribe-client"

type PermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied"
type PushPlugin = {
  checkPermissions: () => Promise<{ receive: PermissionState }>
  requestPermissions: () => Promise<{ receive: PermissionState }>
  register: () => Promise<void>
  createChannel?: (c: { id: string; name: string; importance: number; visibility?: number }) => Promise<void>
  addListener: (event: string, cb: (data: unknown) => void) => Promise<{ remove: () => Promise<void> }> | { remove: () => Promise<void> }
}

function plugin(): PushPlugin | null {
  if (typeof window === "undefined") return null
  if (!/TTMPush/.test(navigator.userAgent)) return null
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: { PushNotifications?: PushPlugin } } })
    .Capacitor
  if (!cap?.isNativePlatform?.()) return null
  return cap.Plugins?.PushNotifications ?? null
}

export function isNativePushAvailable(): boolean {
  return plugin() !== null
}

let listenersReady = false

async function ensureListeners(p: PushPlugin): Promise<void> {
  if (listenersReady) return
  listenersReady = true
  await p.addListener("registration", (data) => {
    const token = (data as { value?: string })?.value
    if (!token) return
    try {
      localStorage.setItem("ttm-native-push-token", token)
    } catch {
      /* storage blocked */
    }
    void fetch("/api/push/device", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: "android", locale: currentUiLocale() }),
    }).catch(() => null)
  })
  // Tapping a notification opens the chat / likes it points to.
  await p.addListener("pushNotificationActionPerformed", (action) => {
    const url = (action as { notification?: { data?: { url?: string } } })?.notification?.data?.url
    if (url && url.startsWith("/")) window.location.assign(url)
  })
}

/** Registers the device when permission is (or becomes) granted. `ask` shows the system dialog. */
export async function syncNativePush(opts: { ask: boolean }): Promise<PermissionState | "unavailable"> {
  const p = plugin()
  if (!p) return "unavailable"
  try {
    let { receive } = await p.checkPermissions()
    if (receive !== "granted" && receive !== "denied" && opts.ask) receive = (await p.requestPermissions()).receive
    if (receive !== "granted") return receive
    await p.createChannel?.({ id: "luvia_default", name: "Luvia", importance: 4, visibility: 1 }).catch(() => null)
    await ensureListeners(p)
    await p.register()
    return "granted"
  } catch {
    return "unavailable"
  }
}

export function storedNativePushToken(): string | null {
  try {
    return localStorage.getItem("ttm-native-push-token")
  } catch {
    return null
  }
}
