import { AuthShell } from "@/components/auth-shell"
import { LoginForm } from "@/components/login-form"

export const metadata = {
  title: "Вход — Time to Match",
  description: "Войдите в аккаунт и продолжите поиск пары",
}

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  )
}
