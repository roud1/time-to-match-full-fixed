"use client"

import { LoginForm } from "@/components/login-form"
import { LoginLiveStatus } from "@/components/auth/login-live-status"
import { LoginTrustRow } from "@/components/auth/login-trust-row"

export function LoginPageExperience() {
  return (
    <div className="ttm-auth-form-page">
      <LoginLiveStatus />
      <LoginForm />
      <LoginTrustRow />
    </div>
  )
}
