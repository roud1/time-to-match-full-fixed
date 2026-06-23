"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { requestPasswordReset } from "@/client/lib/auth/client"
import { CinematicButton } from "@/client/components/ui/cinematic-button"
import { CinematicCard } from "@/client/components/ui/cinematic-card"
import { CinematicField } from "@/client/components/ui/cinematic-field"
import { Input } from "@/client/components/ui/input"

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
        setSuccess(result.message ?? t("forgotPasswordSent"))
        return
      }
      if (result.demoFallback) {
        setError(t("forgotPasswordDemo"))
        return
      }
      setError(result.message ?? t("forgotPasswordError"))
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
          <h1 className="ttm-brand-title text-foreground mb-2">{t("forgotPasswordTitle")}</h1>
          <p className="ttm-brand-caption">{t("forgotPasswordSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-400/95 font-light text-center px-2 leading-relaxed">{error}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-400/95 font-light text-center px-2 leading-relaxed">{success}</p>
          )}

          <CinematicField label={t("regEmail")} error={undefined}>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("regEmailPlaceholder")}
            />
          </CinematicField>

          <CinematicButton type="submit" variant="primary" size="mobile" className="w-full mt-1" disabled={loading}>
            {loading ? t("forgotPasswordSending") : t("forgotPasswordSubmit")}
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
