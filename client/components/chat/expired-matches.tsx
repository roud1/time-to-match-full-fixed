"use client"

import { useCallback, useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { usePremiumUpgrade } from "@/client/components/premium/premium-upgrade-context"
import { formatChatThreadPreviewTime } from "@/client/lib/format-chat-time"

type Restorable = { matchId: string; peerUserId: string; peerName: string | null; peerPhoto: string | null; expiredAt: string }

/** Chats → matches that ran out of time in the last 30 days, with "Restore" (Premium). */
export function ExpiredMatches() {
  const { t, locale } = useI18n()
  const { openUpgrade } = usePremiumUpgrade()
  const [items, setItems] = useState<Restorable[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    void fetch("/api/matches/restorable", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ matches: Restorable[] }>) : { matches: [] }))
      .then((d) => setItems(d.matches ?? []))
      .catch(() => null)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const restore = async (m: Restorable) => {
    setBusy(m.matchId)
    setError(null)
    const res = await fetch(`/api/matches/${m.matchId}/restore`, { method: "POST", credentials: "include" }).catch(() => null)
    setBusy(null)
    if (res?.status === 402) {
      openUpgrade("timer")
      return
    }
    if (!res?.ok) {
      setError(t("expiredRestoreFailed"))
      return
    }
    setItems((list) => list.filter((x) => x.matchId !== m.matchId))
    window.dispatchEvent(new CustomEvent("ttm-social-updated"))
    window.dispatchEvent(new CustomEvent("ttm-connection-updated"))
  }

  if (items.length === 0) return null

  return (
    <section className="ttm-app-expired" aria-label={t("expiredTitle")}>
      <p className="ttm-app-expired__title">{t("expiredTitle")}</p>
      <p className="ttm-app-expired__hint">{t("expiredHint")}</p>
      <ul className="ttm-app-expired__list">
        {items.map((m) => (
          <li key={m.matchId} className="ttm-app-expired__row">
            <span className="ttm-app-expired__avatar" aria-hidden>
              {m.peerPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.peerPhoto} alt="" />
              ) : (
                <span>{(m.peerName ?? "?").slice(0, 1)}</span>
              )}
            </span>
            <span className="ttm-app-expired__text">
              <span className="ttm-app-expired__name">{m.peerName ?? "—"}</span>
              <span className="ttm-app-expired__meta">
                {t("expiredAt").replace("{time}", formatChatThreadPreviewTime(Date.parse(m.expiredAt), locale))}
              </span>
            </span>
            <button type="button" className="ttm-app-expired__btn" disabled={busy === m.matchId} onClick={() => void restore(m)}>
              <RotateCcw aria-hidden />
              {t("expiredRestore")}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="ttm-app-expired__error" role="alert">{error}</p>}
    </section>
  )
}
