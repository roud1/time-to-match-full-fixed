import { AuthShell } from "@/components/auth-shell"
import { OnboardingGate } from "@/components/onboarding-gate"
import { RegisterForm } from "@/components/register-form"

export const metadata = {
  title: "Регистрация — Time to Match",
  description: "Создайте профиль и начните 72-часовой поиск пары",
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <OnboardingGate>
        <RegisterForm />
      </OnboardingGate>
    </AuthShell>
  )
}
