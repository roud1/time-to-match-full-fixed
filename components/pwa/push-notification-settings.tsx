"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import {
  getPushEnabled,
  isPushSupported,
  requestPushPermission,
  setPushEnabled,
} from "@/lib/push-notifications"
import { trackProductEvent } from "@/lib/analytics-client"
import { cn } from "@/lib/utils"

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

  const handleToggle = async () => {
    if (!supported) return
    if (!enabled) {
      const perm = await requestPushPermission()
      setPermission(perm)
      if (perm !== "granted") return
      setPushEnabled(true)
      setEnabled(true)
      trackProductEvent("push_enabled")
    } else {
      setPushEnabled(false)
      setEnabled(false)
      trackProductEvent("push_disabled")
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
    </div>
  )
}
