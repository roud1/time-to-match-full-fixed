"use client"

import Link from "next/link"
import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { updateUserDiscoveryProfile } from "@/client/lib/discover/api"
import { updateUserProfile } from "@/client/lib/user-profile"

/**
 * Accounts created before the separate consent existed: matching uses gender and "looking for",
 * which may reveal sexual orientation (GDPR Art. 9), so ask for explicit consent once.
 */
export function SensitiveConsentGate({ onDone }: { onDone: () => void }) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const agree = async () => {
    setBusy(true)
    setFailed(false)
    const at = new Date().toISOString()
    const ok = await updateUserDiscoveryProfile({ profile: { sensitiveDataConsentAt: at } }).catch(() => false)
    setBusy(false)
    if (!ok) {
      setFailed(true)
      return
    }
    updateUserProfile({ sensitiveDataConsentAt: at })
    onDone()
  }

  return (
    <div className="lv-consent-gate" role="dialog" aria-modal="true" aria-labelledby="lv-consent-gate-title">
      <div className="lv-consent-gate__box">
        <span className="lv-consent-gate__icon" aria-hidden>
          <ShieldCheck strokeWidth={1.8} />
        </span>
        <h2 id="lv-consent-gate-title">{t("lvConsentGateTitle")}</h2>
        <p>{t("regSensitiveConsent")}</p>
        {failed && <p className="lv-consent-gate__error" role="alert">{t("lvSetDeleteError")}</p>}
        <button type="button" className="lv-consent-gate__agree" onClick={() => void agree()} disabled={busy}>
          {busy ? "…" : t("lvConsentGateAgree")}
        </button>
        <Link href="/settings" className="lv-consent-gate__decline">
          {t("lvConsentGateDecline")}
        </Link>
      </div>
    </div>
  )
}
