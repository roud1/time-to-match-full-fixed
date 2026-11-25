/**
 * Android app push (Firebase via @capacitor/push-notifications). Only active in an APK built with
 * Firebase config — that build adds "TTMPush" to the user agent (mobile/capacitor.config.js);
 * calling the plugin without Firebase config would crash the app, so it is never touched then.
 */

import { currentUiLocale } from "@/client/lib/push-subscribe-client"
import { addNativeListener, callNative, nativeBridge } from "@/client/lib/capacitor-bridge"

type PermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied"

const PLUGIN = "PushNotifications"

/** True in an APK built with Firebase config and the push plugin. */
function available(): boolean {
  if (typeof window === "undefined" || !/TTMPush/.test(navigator.userAgent)) return false
  const cap = nativeBridge()
  if (!cap) return false
  return cap.isPluginAvailable ? cap.isPluginAvailable(PLUGIN) || Boolean(cap.nativePromise) : Boolean(cap.nativePromise)
}

export function isNativePushAvailable(): boolean {
  return available()
}

let listenersReady = false

function ensureListeners(): void {
  if (listenersReady) return
  listenersReady = true
  addNativeListener(PLUGIN, "registration", (data) => {
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
  addNativeListener(PLUGIN, "pushNotificationActionPerformed", (action) => {
    const url = (action as { notification?: { data?: { url?: string } } })?.notification?.data?.url
    if (url && url.startsWith("/")) window.location.assign(url)
  })
}

/** Registers the device when permission is (or becomes) granted. `ask` shows the system dialog. */
export async function syncNativePush(opts: { ask: boolean }): Promise<PermissionState | "unavailable"> {
  if (!available()) return "unavailable"
  try {
    let { receive } = await callNative<{ receive: PermissionState }>(PLUGIN, "checkPermissions")
    if (receive !== "granted" && receive !== "denied" && opts.ask) {
      receive = (await callNative<{ receive: PermissionState }>(PLUGIN, "requestPermissions")).receive
    }
    if (receive !== "granted") return receive
    await callNative(PLUGIN, "createChannel", { id: "luvia_default", name: "Luvia", importance: 4, visibility: 1 }).catch(() => null)
    ensureListeners()
    await callNative(PLUGIN, "register")
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
