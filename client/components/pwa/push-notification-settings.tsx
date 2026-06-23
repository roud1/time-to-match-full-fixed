"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import {
  getPushEnabled,
  isPushSupported,
  setPushEnabled,
} from "@/client/lib/push-notifications"
import { usePushSubscription } from "@/client/hooks/use-push-subscription"
import { sendTestPush } from "@/client/lib/push-subscribe-client"
import { trackProductEvent } from "@/client/lib/analytics-client"
import { cn } from "@/client/lib/utils"

export function PushNotificationSettings() {
  const { t } = useI18n()
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    setSupported(isPushSupported())
    setEnabled(getPushEnabled())
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission)
    }
  }, [])

  const { enablePush } = usePushSubscription(enabled)

  const handleToggle = async () => {
    if (!supported) return
    if (!enabled) {
      const ok = await enablePush()
      setPermission(typeof Notification !== "undefined" ? Notification.permission : "denied")
      if (!ok) return
      setPushEnabled(true)
      setEnabled(true)
      trackProductEvent("push_enabled")
    } else {
      setPushEnabled(false)
      setEnabled(false)
      trackProductEvent("push_disabled")
    }
  }

  const handleTestPush = async () => {
    const ok = await sendTestPush()
    if (!ok && typeof window !== "undefined") {
      window.alert(t("pushTestFailed"))
    }
  }

  if (!supported) {
    return <p className="text-xs text-white/40 font-light">{t("pushUnsupported")}</p>
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between ttm-brand-glass rounded-2xl px-4 py-3 cursor-pointer gap-4">
        <div>
          <span className="text-sm font-extralight text-white/85 block">{t("pushToggleLabel")}</span>
          <span className="text-xs text-white/45 font-light mt-1 block leading-relaxed">
            {t("pushToggleHint")}
          </span>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => void handleToggle()}
          className="accent-indigo-400 shrink-0"
        />
      </label>
      <p
        className={cn(
          "text-[10px] font-light uppercase tracking-wider",
          permission === "granted" ? "text-emerald-400/70" : "text-white/35"
        )}
      >
        {permission === "granted" ? t("pushStatusOn") : t("pushStatusOff")}
      </p>
      {permission === "granted" && (
        <button
          type="button"
          onClick={() => void handleTestPush()}
          className="text-xs text-indigo-200/80 hover:text-indigo-100 font-light"
        >
          {t("pushTestCta")}
        </button>
      )}
    </div>
  )
}
