import { RegisterPageExperience } from "@/components/auth/register-page-experience"
import { AuthShell } from "@/components/auth-shell"

export const metadata = {
  title: "Регистрация — Time to Match",
  description: "Создайте профиль и начните поиск пары с мэтчами на 24 часа",
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterPageExperience />
    </AuthShell>
  )
}
