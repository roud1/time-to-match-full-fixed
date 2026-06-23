import { Suspense } from "react"
import { AuthShell } from "@/client/components/auth-shell"
import { WelcomeScreen } from "@/client/components/welcome-screen"

export const metadata = {
  title: "Добро пожаловать — Time to Match",
  description: "Ваш профиль готов. У каждого мэтча — 24 часа, чтобы зажечь диалог.",
}

export default function WelcomePage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="ttm-brand-glass rounded-3xl p-8 w-full text-center text-muted-foreground font-light text-sm">
            …
          </div>
        }
      >
        <WelcomeScreen />
      </Suspense>
    </AuthShell>
  )
}
