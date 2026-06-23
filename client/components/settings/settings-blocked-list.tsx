"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import {
  getTrustSafetyState,
  unblockProfile,
} from "@/client/lib/trust-safety-store"
import { fetchBlockedUsersOnServer, unblockUserOnServer } from "@/client/lib/trust-safety-api"
import { useTrustSafetyVersion } from "@/client/hooks/use-trust-safety-version"

type BlockedEntry = {
  profileId: number
  serverUserId: string | null
  label: string
}

export function SettingsBlockedList() {
  const { t } = useI18n()
  const trustV = useTrustSafetyVersion()
  const [entries, setEntries] = useState<BlockedEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const localIds = getTrustSafetyState().blockedIds
      const server = await fetchBlockedUsersOnServer()

      const merged = new Map<number, BlockedEntry>()

      for (const id of localIds) {
        merged.set(id, {
          profileId: id,
          serverUserId: null,
          label: `${t("trustBlockedUser")} #${id}`,
        })
      }

      if (server.ok) {
        for (const row of server.blocked) {
          merged.set(row.blockedProfileId, {
            profileId: row.blockedProfileId,
            serverUserId: row.blockedUserId,
            label: `${t("trustBlockedUser")} #${row.blockedProfileId}`,
          })
        }
      }

      if (!cancelled) {
        setEntries([...merged.values()])
        setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [trustV, t])

  if (loading) {
    return <p className="text-xs text-white/40 font-light">{t("locationLoading")}</p>
  }

  if (entries.length === 0) {
    return <p className="text-xs text-white/40 font-light">{t("settingsBlockedHint")}</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/45 font-light">{t("settingsBlockedHint")}</p>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.profileId}
            className="flex items-center justify-between ttm-brand-glass rounded-2xl px-4 py-3 gap-3"
          >
            <span className="text-sm font-extralight text-white/75">{entry.label}</span>
            <button
              type="button"
              onClick={() => {
                unblockProfile(entry.profileId)
                if (entry.serverUserId) {
                  void unblockUserOnServer(entry.serverUserId)
                }
                setEntries((prev) => prev.filter((e) => e.profileId !== entry.profileId))
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
