"use client"

import { RegisterForm } from "@/client/components/register-form"
import { LoginTrustRow } from "@/client/components/auth/login-trust-row"

export function RegisterPageExperience() {
  return (
    <div className="ttm-auth-form-page">
      <RegisterForm />
      <LoginTrustRow />
    </div>
  )
}
