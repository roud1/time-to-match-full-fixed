import { ForgotPasswordForm } from "@/client/components/forgot-password-form"
import { AuthShell } from "@/client/components/auth-shell"

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
