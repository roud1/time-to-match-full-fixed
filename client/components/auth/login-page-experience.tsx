"use client"

import { LoginForm } from "@/client/components/login-form"
import { LoginLiveStatus } from "@/client/components/auth/login-live-status"
import { LoginTrustRow } from "@/client/components/auth/login-trust-row"

export function LoginPageExperience() {
  return (
    <div className="ttm-auth-form-page">
      <LoginLiveStatus />
      <LoginForm />
      <LoginTrustRow />
    </div>
  )
}
