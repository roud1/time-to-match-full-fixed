import { AuthShell } from "@/components/auth-shell"
import { RegisterForm } from "@/components/register-form"

export const metadata = {
  title: "Регистрация — Time to Match",
  description: "Создайте профиль и начните 72-часовой поиск пары",
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  )
}
