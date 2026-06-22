"use client"

import { RegisterForm } from "@/components/register-form"
import { LoginTrustRow } from "@/components/auth/login-trust-row"

export function RegisterPageExperience() {
  return (
    <div className="ttm-auth-form-page">
      <RegisterForm />
      <LoginTrustRow />
    </div>
  )
}
