import { Suspense } from "react"
import { ProfilePageShell } from "@/client/components/app/profile-page-shell"
import { ProfileScreen } from "@/client/components/profile-screen"

export const metadata = {
  title: "Мой профиль — Time to Match",
  description: "Управление профилем, атмосферой и живыми связями.",
}

export default function ProfilePage() {
  return (
    <ProfilePageShell>
      <Suspense
        fallback={
          <div className="w-full py-16 text-center text-muted-foreground font-light text-sm">
            …
          </div>
        }
      >
        <ProfileScreen />
      </Suspense>
    </ProfilePageShell>
  )
}
