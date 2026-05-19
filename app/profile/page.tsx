import { Suspense } from "react"
import { AuthShell } from "@/components/auth-shell"
import { ProfileScreen } from "@/components/profile-screen"

export const metadata = {
  title: "Мой профиль — Time to Match",
  description: "Управление профилем и 72-часовым таймером.",
}

export default function ProfilePage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="w-full max-w-lg py-12 text-center text-muted-foreground font-light">…</div>}>
        <ProfileScreen />
      </Suspense>
    </AuthShell>
  )
}
