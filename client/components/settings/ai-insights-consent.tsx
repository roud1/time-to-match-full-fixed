"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { updateUserDiscoveryProfile } from "@/client/lib/discover/api"
import { getUserProfile, updateUserProfile } from "@/client/lib/user-profile"

/**
 * Opt-in (GDPR): AI connection insights send the chat transcript, which includes the other
 * person's messages, to the AI provider. The server does that only when BOTH people opted in.
 */
export function AiInsightsConsent() {
  const { t } = useI18n()
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setOn(getUserProfile()?.aiInsightsConsent === true)
    void fetch("/api/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: { aiInsightsConsent?: boolean } } | null) => {
        if (d?.user) setOn(d.user.aiInsightsConsent === true)
      })
      .catch(() => {})
  }, [])

  const toggle = async (next: boolean) => {
    if (busy) return
    setBusy(true)
    setOn(next)
    const ok = await updateUserDiscoveryProfile({ profile: { aiInsightsConsent: next } }).catch(() => false)
    if (ok) updateUserProfile({ aiInsightsConsent: next })
    else setOn(!next)
    setBusy(false)
  }

  return (
    <label className="lv-set__row lv-consent">
      <span className="lv-set__text">
        <span className="lv-set__label lv-set__label--wrap">{t("lvAiConsentTitle")}</span>
        <span className="lv-set__hint">{t("lvAiConsentBody")}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={on}
        disabled={busy}
        onChange={(e) => void toggle(e.target.checked)}
        aria-label={t("lvAiConsentTitle")}
      />
    </label>
  )
}
