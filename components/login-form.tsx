"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useHydrated } from "@/hooks/use-hydrated"
import { useI18n } from "@/lib/i18n"
import {
  getUserProfile,
  hasRegisteredAccount,
  isLoggedIn,
  setSession,
  verifyLogin,
} from "@/lib/user-profile"
import { recordProfileActivity } from "@/lib/profile-life-store"
import { isWelcomeSeen } from "@/lib/welcome-seen"
import { CinematicButton } from "@/components/ui/cinematic-button"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { CinematicField } from "@/components/ui/cinematic-field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type FormData = {
  email: string
  password: string
  remember: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>> & { form?: string }

export function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()
  const hydrated = useHydrated()
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    remember: false,
  })

  const postAuthPath = () => (isWelcomeSeen() ? "/app" : "/welcome")

  useEffect(() => {
    if (!hydrated) return
    if (isLoggedIn()) {
      setRedirecting(true)
      const target = postAuthPath()
      router.replace(target)
      const fallback = window.setTimeout(() => {
        if (window.location.pathname === "/login") window.location.assign(target)
      }, 3000)
      return () => window.clearTimeout(fallback)
    }
    const profile = getUserProfile()
    if (profile?.email) {
      setForm((prev) => ({ ...prev, email: profile.email }))
    }
  }, [hydrated, router])

  useEffect(() => {
    if (!loading) return
    const id = window.setTimeout(() => setLoading(false), 12_000)
    return () => window.clearTimeout(id)
  }, [loading])

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hydrated || loading) return

    const next: FormErrors = {}

    if (!form.email.trim()) next.email = t("regErrorRequired")
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t("regErrorEmail")
    if (!form.password) next.password = t("regErrorRequired")

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    if (!hasRegisteredAccount()) {
      setErrors({ form: t("loginErrorNoAccount") })
      return
    }

    if (!verifyLogin(form.email, form.password)) {
      setErrors({ form: t("loginErrorInvalid") })
      return
    }

    setLoading(true)
    setSession(form.email, form.remember)
    recordProfileActivity()
    router.replace(postAuthPath())
  }

  if (!hydrated || redirecting) {
    return (
      <div className="w-full max-w-md">
        <CinematicCard variant="glass" className="p-8 text-center">
          <p className="ttm-type-muted">{t("loginLoading")}</p>
        </CinematicCard>
      </div>
    )
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
          <span className="ttm-badge-brand block mx-auto w-fit mb-4">SYNC</span>
          <h1 className="ttm-brand-title text-foreground mb-2">{t("loginPageTitle")}</h1>
          <p className="ttm-brand-caption">{t("loginPageSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {errors.form && (
            <p className="text-sm text-red-400/95 font-light text-center px-2 leading-relaxed">
              {errors.form}
              {!hasRegisteredAccount() && (
                <>
                  {" "}
                  <Link href="/register" className="text-white/60 hover:underline">
                    {t("loginSignUp")}
                  </Link>
                </>
              )}
            </p>
          )}

          <CinematicField label={t("regEmail")} error={errors.email}>
            <Input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder={t("regEmailPlaceholder")}
            />
          </CinematicField>

          <CinematicField label={t("regPassword")} error={errors.password}>
            <Input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={t("regPasswordPlaceholder")}
            />
          </CinematicField>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={form.remember}
                onCheckedChange={(checked) => update("remember", checked === true)}
              />
              <label htmlFor="remember" className="ttm-type-muted cursor-pointer">
                {t("loginRemember")}
              </label>
            </div>
            <button type="button" className="ttm-type-muted text-white/60 hover:underline">
              {t("loginForgotPassword")}
            </button>
          </div>

          <CinematicButton
            type="submit"
            variant="primary"
            size="mobile"
            className="w-full mt-1"
            disabled={loading}
          >
            {loading ? t("loginLoading") : t("loginSubmit")}
          </CinematicButton>
        </form>

        <p className="text-center ttm-type-muted mt-6">
          {t("loginNoAccount")}{" "}
          <Link href="/register" className="text-white/60 hover:underline">
            {t("loginSignUp")}
          </Link>
        </p>
      </CinematicCard>
    </motion.div>
  )
}
