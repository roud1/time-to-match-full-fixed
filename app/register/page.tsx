import { RegisterPageExperience } from "@/client/components/auth/register-page-experience"
import { AuthShell } from "@/client/components/auth-shell"

export const metadata = {
  title: "Регистрация — Luvia",
  description: "Создайте профиль и начните поиск пары с мэтчами на 24 часа",
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterPageExperience />
    </AuthShell>
  )
}
