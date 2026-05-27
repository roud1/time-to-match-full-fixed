"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  isPushSupported,
  registerAppServiceWorker,
  requestPushPermission,
} from "@/lib/push-notifications"
import {
  postPushSubscription,
  subscriptionToJson,
  urlBase64ToUint8Array,
} from "@/lib/push-subscribe-client"

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

/**
 * Registers SW, requests permission when enabled, and syncs subscription to the server.
 */
export function usePushSubscription(enabled: boolean) {
  const syncing = useRef(false)

  const syncSubscription = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force === true
    if (!force && !enabled) return
    if (!isPushSupported() || !VAPID_PUBLIC || syncing.current) return
    if (Notification.permission !== "granted") return

    syncing.current = true
    try {
      const reg = await registerAppServiceWorker()
      if (!reg?.pushManager) return

      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
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
