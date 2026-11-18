"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { resetPasswordOnServer } from "@/client/lib/auth/client"
import { AppAuthField } from "@/client/components/auth/app-auth-field"
import { AppAuthScreen } from "@/client/components/auth/app-auth-screen"

export function ResetPasswordForm() {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hydrated || loading) return

    if (!token) {
      setError(t("resetPasswordInvalidLink"))
      return
    }
    if (password.length < 8) {
      setError(t("regErrorPassword"))
      return
    }
    if (password !== confirm) {
      setError(t("regErrorPasswordMatch"))
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await resetPasswordOnServer({ token, password })
      if (result.ok) {
        router.replace("/login")
        return
      }
      // Localized text instead of the server's English message (expired / invalid link, weak password…).
      setError(t("resetPasswordError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppAuthScreen
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordSubtitle")}
      notice={error ? { kind: "error", text: error } : null}
      footer={<Link href="/login">{t("forgotPasswordBackToLogin")}</Link>}
    >
      <form onSubmit={handleSubmit} noValidate className="ttm-app-login__form ttm-app-login__form--flat">
        <AppAuthField
          icon={Lock}
          label={t("regPassword")}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(null)
          }}
        />
        <AppAuthField
          icon={Lock}
          label={t("resetPasswordConfirm")}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            setError(null)
          }}
        />
        <button type="submit" className="ttm-app-login__submit" disabled={loading}>
          {loading ? t("resetPasswordSaving") : t("resetPasswordSubmit")}
        </button>
      </form>
    </AppAuthScreen>
  )
}
