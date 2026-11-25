"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  isPushSupported,
  registerAppServiceWorker,
  requestPushPermission,
} from "@/client/lib/push-notifications"
import {
  getVapidPublicKeyClient,
  postPushSubscription,
  subscriptionToJson,
  urlBase64ToUint8Array,
} from "@/client/lib/push-subscribe-client"

/**
 * Registers SW, requests permission when enabled, and syncs subscription to the server.
 */
export function usePushSubscription(enabled: boolean) {
  const syncing = useRef(false)

  const syncSubscription = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force === true
    if (!force && !enabled) return
    if (!isPushSupported() || syncing.current) return
    if (Notification.permission !== "granted") return
    const vapidPublic = await getVapidPublicKeyClient()
    if (!vapidPublic) return

    syncing.current = true
    try {
      const reg = await registerAppServiceWorker()
      if (!reg?.pushManager) return

      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublic),
        })
      }

      await postPushSubscription(subscriptionToJson(sub))
    } catch {
      /* permission denied or invalid VAPID */
    } finally {
      syncing.current = false
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    void syncSubscription()
  }, [enabled, syncSubscription])

  const enablePush = useCallback(async () => {
    const perm = await requestPushPermission()
    if (perm !== "granted") return false
    await syncSubscription({ force: true })
    return true
  }, [syncSubscription])

  return { enablePush, syncSubscription }
}
