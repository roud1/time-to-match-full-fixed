"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { requestPasswordReset } from "@/client/lib/auth/client"
import { AppAuthField } from "@/client/components/auth/app-auth-field"
import { AppAuthScreen } from "@/client/components/auth/app-auth-screen"

export function ForgotPasswordForm() {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hydrated || loading) return

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("regErrorEmail"))
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await requestPasswordReset(trimmed)
      if (result.ok) {
        // Same neutral text for every email (no account enumeration); localized, not the server's English message.
        setSuccess(t("forgotPasswordSent"))
        return
      }
      if (result.demoFallback) {
        setError(t("forgotPasswordDemo"))
        return
      }
      setError(t("forgotPasswordError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppAuthScreen
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      notice={error ? { kind: "error", text: error } : success ? { kind: "success", text: success } : null}
      footer={<Link href="/login">{t("forgotPasswordBackToLogin")}</Link>}
    >
      <form onSubmit={handleSubmit} noValidate className="ttm-app-login__form ttm-app-login__form--flat">
        <AppAuthField
          icon={Mail}
          label={t("regEmail")}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError(null)
          }}
        />
        <button type="submit" className="ttm-app-login__submit" disabled={loading}>
          {loading ? t("forgotPasswordSending") : t("forgotPasswordSubmit")}
        </button>
      </form>
    </AppAuthScreen>
  )
}
