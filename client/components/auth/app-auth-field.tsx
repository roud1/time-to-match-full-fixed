"use client"

import "./app-login.css"
import { useId, useState, type ComponentType, type InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"

type AppAuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>
  label: string
  error?: string
}

/**
 * Text field of the in-app auth screens (icon + input, optional show-password toggle).
 * Uses the .ttm-app-login__* styles; only rendered inside the app (html[data-ttm-app]).
 */
export function AppAuthField({ icon: Icon, label, error, type = "text", ...input }: AppAuthFieldProps) {
  const { t } = useI18n()
  const errId = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <label className="ttm-app-login__field" data-invalid={error ? "" : undefined}>
        <Icon aria-hidden className="ttm-app-login__icon" strokeWidth={1.6} />
        <input
          {...input}
          type={isPassword && show ? "text" : type}
          placeholder={label}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="ttm-app-login__eye"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? t("appHidePassword") : t("appShowPassword")}
            aria-pressed={show}
          >
            {show ? <EyeOff aria-hidden strokeWidth={1.6} /> : <Eye aria-hidden strokeWidth={1.6} />}
          </button>
        )}
      </label>
      {error && (
        <p id={errId} className="ttm-app-login__error">
          {error}
        </p>
      )}
    </div>
  )
}
