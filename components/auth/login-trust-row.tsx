"use client"

import { Eye, Lock, Shield } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const ITEMS = [
  { key: "loginTrustSecure" as const, Icon: Shield },
  { key: "loginTrustModeration" as const, Icon: Eye },
  { key: "loginTrustPrivacy" as const, Icon: Lock },
]

export function LoginTrustRow() {
  const { t } = useI18n()

  return (
    <ul className="ttm-login-trust" aria-label={t("loginTrustAria")}>
      {ITEMS.map(({ key, Icon }) => (
        <li key={key} className="ttm-login-trust__item">
          <Icon className="ttm-login-trust__icon" strokeWidth={1.5} aria-hidden />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  )
}
