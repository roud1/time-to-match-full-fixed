"use client"

import "./app-login.css"
import type { ReactNode } from "react"
import Image from "@/client/components/ui/smart-image"

type AppAuthScreenProps = {
  title: string
  subtitle?: string
  /** Error (red) or success (green) message above the form. */
  notice?: { kind: "error" | "success"; text: string } | null
  children: ReactNode
  footer?: ReactNode
}

/**
 * Shared Luvia 2.0 layout for auth screens (sign in, password recovery, reset):
 * logo, title, subtitle, notice, form, footer link. Styles: app-login.css (.ttm-app-login__*).
 */
export function AppAuthScreen({ title, subtitle, notice, children, footer }: AppAuthScreenProps) {
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
      <h1 className="ttm-app-login__title">{title}</h1>
      {subtitle && <p className="ttm-app-login__subtitle">{subtitle}</p>}
      <div className="ttm-app-login__form">
        {notice && (
          <p
            className={notice.kind === "error" ? "ttm-app-login__form-error" : "ttm-app-login__form-ok"}
            role={notice.kind === "error" ? "alert" : "status"}
          >
            {notice.text}
          </p>
        )}
        {children}
      </div>
      {footer && <p className="ttm-app-login__signup">{footer}</p>}
    </div>
  )
}
