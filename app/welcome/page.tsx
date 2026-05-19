import { AuthShell } from "@/components/auth-shell"
import { WelcomeScreen } from "@/components/welcome-screen"

export const metadata = {
  title: "Добро пожаловать — Time to Match",
  description: "Ваш профиль создан. 72 часа на поиск пары начались.",
}

export default function WelcomePage() {
  return (
    <AuthShell>
      <WelcomeScreen />
    </AuthShell>
  )
}
