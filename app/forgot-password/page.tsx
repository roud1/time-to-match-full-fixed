import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { AuthShell } from "@/components/auth-shell"

export const metadata = {
  title: "Сброс пароля — Time to Match",
  description: "Запросите ссылку для сброса пароля",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
