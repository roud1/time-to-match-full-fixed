"use client"

import { useI18n } from "@/client/lib/i18n"
import {
  getPushEnabled,
  isPushSupported,
} from "@/client/lib/push-notifications"
import { usePushSubscription } from "@/client/hooks/use-push-subscription"
import { cn } from "@/client/lib/utils"

type PushPromptBannerProps = {
  className?: string
  onDismiss?: () => void
}

/** Minimal push permission prompt — shown after first match when VAPID is configured. */
export function PushPromptBanner({ className, onDismiss }: PushPromptBannerProps) {
  const { t } = useI18n()
  const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
  const supported = isPushSupported() && vapidConfigured

  const { enablePush } = usePushSubscription(false)

  if (!supported || getPushEnabled()) return null
  if (typeof Notification !== "undefined" && Notification.permission === "denied") return null

  const handleEnable = async () => {
    const ok = await enablePush()
    if (ok) {
      const { setPushEnabled } = await import("@/client/lib/push-notifications")
      setPushEnabled(true)
    }
    onDismiss?.()
  }

  return (
    <div
      className={cn(
        "ttm-brand-glass rounded-2xl border border-white/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extralight text-white/90">{t("pushPromptTitle")}</p>
        <p className="text-xs text-white/45 font-light mt-1 leading-relaxed">{t("pushPromptBody")}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => void handleEnable()}
          className="rounded-xl bg-indigo-500/20 border border-indigo-400/30 px-4 py-2 text-xs font-light text-indigo-100 hover:bg-indigo-500/30 transition-colors touch-manipulation"
        >
          {t("pushPromptEnable")}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl px-3 py-2 text-xs font-light text-white/40 hover:text-white/65 transition-colors touch-manipulation"
        >
          {t("pushPromptLater")}
        </button>
      </div>
    </div>
  )
}
