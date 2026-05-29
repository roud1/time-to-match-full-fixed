import { LoginPageExperience } from "@/components/auth/login-page-experience"
import { AuthShell } from "@/components/auth-shell"

export const metadata = {
  title: "Вход — Time to Match",
  description: "Войдите в аккаунт и продолжите поиск пары",
}

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginPageExperience />
    </AuthShell>
  )
}
