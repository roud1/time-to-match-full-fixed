"use client"

import { AuthMarketingLayout } from "@/components/auth/auth-marketing-layout"
import { RegisterForm } from "@/components/register-form"

export function RegisterPageExperience() {
  return (
    <AuthMarketingLayout wide>
      <RegisterForm />
    </AuthMarketingLayout>
  )
}
