"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  getUserProfile,
  hasRegisteredAccount,
  isLoggedIn,
  setSession,
  verifyLogin,
} from "@/lib/user-profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type FormData = {
  email: string
  password: string
  remember: boolean
}

type FormErrors = Partial<Record<keyof FormData, string>> & { form?: string }

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground/80 font-light">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400 font-light">{error}</p>}
    </div>
  )
}

export function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    remember: false,
  })

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/welcome")
      return
    }
    const profile = getUserProfile()
    if (profile?.email) {
      setForm((prev) => ({ ...prev, email: profile.email }))
    }
  }, [router])

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    router.push("/welcome")
  }

  return (
    <motion.div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full">
      <motion.div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-light tracking-widest uppercase text-pink-400 border border-pink-500/20 bg-pink-500/10 mb-4">
          72h
        </span>
        <h1 className="text-2xl md:text-3xl font-extralight tracking-tight mb-2">
          {t("loginPageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-light">{t("loginPageSubtitle")}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <p className="text-sm text-red-400 font-light text-center px-2 leading-relaxed">
            {errors.form}
            {!hasRegisteredAccount() && (
              <>
                {" "}
                <Link href="/register" className="text-pink-400 hover:underline">
                  {t("loginSignUp")}
                </Link>
              </>
            )}
          </p>
        )}

        <Field label={t("regEmail")} error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t("regEmailPlaceholder")}
            className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
          />
        </Field>

        <Field label={t("regPassword")} error={errors.password}>
          <Input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder={t("regPasswordPlaceholder")}
            className="h-11 rounded-xl bg-foreground/5 border-foreground/10 font-light"
          />
        </Field>

        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={form.remember}
              onCheckedChange={(checked) => update("remember", checked === true)}
            />
            <label htmlFor="remember" className="text-xs text-muted-foreground font-light cursor-pointer">
              {t("loginRemember")}
            </label>
          </div>
          <button type="button" className="text-xs text-pink-400 font-light hover:underline">
            {t("loginForgotPassword")}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-light tracking-wide shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? t("loginLoading") : t("loginSubmit")}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground font-light mt-6">
        {t("loginNoAccount")}{" "}
        <Link href="/register" className="text-pink-400 hover:underline">
          {t("loginSignUp")}
        </Link>
      </p>
    </motion.div>
  )
}
