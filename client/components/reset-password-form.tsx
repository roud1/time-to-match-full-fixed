"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { resetPasswordOnServer } from "@/client/lib/auth/client"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { CinematicCard } from "@/client/components/ui/cinematic-card"
import { CinematicField } from "@/client/components/ui/cinematic-field"
import { Input } from "@/client/components/ui/input"

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
      setError(result.message ?? t("resetPasswordError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <CinematicCard variant="glass" className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="ttm-brand-title text-foreground mb-2">{t("resetPasswordTitle")}</h1>
          <p className="ttm-brand-caption">{t("resetPasswordSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-400/95 font-light text-center px-2 leading-relaxed">{error}</p>
          )}

          <CinematicField label={t("regPassword")} error={undefined}>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("regPasswordPlaceholder")}
            />
          </CinematicField>

          <CinematicField label={t("resetPasswordConfirm")} error={undefined}>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("resetPasswordConfirmPlaceholder")}
            />
          </CinematicField>

          <CinematicButton type="submit" variant="primary" size="mobile" className="w-full mt-1" disabled={loading}>
            {loading ? t("resetPasswordSaving") : t("resetPasswordSubmit")}
          </CinematicButton>
        </form>

        <p className="text-center ttm-type-muted mt-6">
          <Link href="/login" className="text-white/60 hover:underline">
            {t("forgotPasswordBackToLogin")}
          </Link>
        </p>
      </CinematicCard>
    </motion.div>
  )
}
