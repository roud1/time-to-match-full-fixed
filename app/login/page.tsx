import { LoginPageExperience } from "@/client/components/auth/login-page-experience"
import { AuthShell } from "@/client/components/auth-shell"

export const metadata = {
  title: "Вход — Luvia",
  description: "Войдите в аккаунт и продолжите поиск пары",
}

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginPageExperience />
    </AuthShell>
  )
}
