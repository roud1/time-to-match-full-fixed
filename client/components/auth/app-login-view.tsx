"use client"

import "./app-login.css"
import { useId, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"

type AppLoginViewProps = {
  email: string
  password: string
  errors: { email?: string; password?: string; form?: string }
  loading: boolean
  /** null = no checkbox (native app always remembers the session). */
  remember: boolean | null
  onRememberChange: (value: boolean) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
}

/** Sign-in screen of the native app / installed PWA (rendered only when html[data-ttm-app] is set). */
export function AppLoginView({
  email,
  password,
  errors,
  loading,
  remember,
  onRememberChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AppLoginViewProps) {
  const { t } = useI18n()
  const [showPassword, setShowPassword] = useState(false)
  const emailErrId = useId()
  const passErrId = useId()

  return (
    <div className="ttm-app-login">
      <div className="ttm-app-login__brand">
        <Image
          className="ttm-app-login__logo"
          src="/brand/luvia/logo.svg"
          alt="Luvia"
          width={719}
          height={200}
          priority
          unoptimized
        />
      </div>

      <h1 className="ttm-app-login__title">{t("loginPageTitle")}</h1>
      <p className="ttm-app-login__subtitle">{t("appLoginSubtitle")}</p>

      <form onSubmit={onSubmit} noValidate className="ttm-app-login__form">
        {errors.form && (
          <p className="ttm-app-login__form-error" role="alert">
            {errors.form}
          </p>
        )}

        <div>
          <label className="ttm-app-login__field" data-invalid={errors.email ? "" : undefined}>
            <Mail aria-hidden className="ttm-app-login__icon" strokeWidth={1.6} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={t("regEmail")}
              aria-label={t("regEmail")}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? emailErrId : undefined}
            />
          </label>
          {errors.email && (
            <p id={emailErrId} className="ttm-app-login__error">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="ttm-app-login__field" data-invalid={errors.password ? "" : undefined}>
            <Lock aria-hidden className="ttm-app-login__icon" strokeWidth={1.6} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder={t("regPassword")}
              aria-label={t("regPassword")}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? passErrId : undefined}
            />
            <button
              type="button"
              className="ttm-app-login__eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("appHidePassword") : t("appShowPassword")}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff aria-hidden strokeWidth={1.6} />
              ) : (
                <Eye aria-hidden strokeWidth={1.6} />
              )}
            </button>
          </label>
          {errors.password && (
            <p id={passErrId} className="ttm-app-login__error">
              {errors.password}
            </p>
          )}
        </div>

        <div className="ttm-app-login__row">
          {remember !== null && (
            <label className="ttm-app-login__remember">
              <input type="checkbox" checked={remember} onChange={(e) => onRememberChange(e.target.checked)} />
              <span>{t("loginRemember")}</span>
            </label>
          )}
          <Link href="/forgot-password" className="ttm-app-login__forgot">
            {t("loginForgotPassword")}
          </Link>
        </div>

        <button type="submit" className="ttm-app-login__submit" disabled={loading}>
          {loading ? t("loginLoading") : t("loginSubmit")}
        </button>
      </form>

      <p className="ttm-app-login__signup">
        <span>{t("loginNoAccount")}</span>{" "}
        <Link href="/register">{t("appLoginRegister")}</Link>
      </p>
    </div>
  )
}
