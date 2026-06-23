import { Suspense } from "react"
import { ResetPasswordForm } from "@/client/components/reset-password-form"
import { AuthShell } from "@/client/components/auth-shell"

export const metadata = {
  title: "Новый пароль — Time to Match",
  description: "Установите новый пароль",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
