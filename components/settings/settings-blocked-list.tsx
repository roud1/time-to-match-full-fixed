"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import {
  getTrustSafetyState,
  unblockProfile,
} from "@/lib/trust-safety-store"
import { useTrustSafetyVersion } from "@/hooks/use-trust-safety-version"

export function SettingsBlockedList() {
  const { t } = useI18n()
  const trustV = useTrustSafetyVersion()
  const [blockedIds, setBlockedIds] = useState<number[]>([])

  useEffect(() => {
    setBlockedIds(getTrustSafetyState().blockedIds)
  }, [trustV])

  if (blockedIds.length === 0) {
    return <p className="text-xs text-white/40 font-light">{t("settingsBlockedHint")}</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/45 font-light">{t("settingsBlockedHint")}</p>
      <ul className="space-y-2">
        {blockedIds.map((id) => (
          <li
            key={id}
            className="flex items-center justify-between ttm-brand-glass rounded-2xl px-4 py-3 gap-3"
          >
            <span className="text-sm font-extralight text-white/75">
              {t("trustBlockedUser")} #{id}
            </span>
            <button
              type="button"
              onClick={() => {
                unblockProfile(id)
                setBlockedIds(getTrustSafetyState().blockedIds)
              }}
              className="text-xs font-light text-indigo-200/80 hover:text-indigo-100 touch-manipulation"
            >
              {t("settingsUnblock")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
