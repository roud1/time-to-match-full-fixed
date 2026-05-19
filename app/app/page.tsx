import { Suspense } from "react"
import { AppShell } from "@/components/app/app-shell"

export const metadata = {
  title: "Лента — Time to Match",
  description: "Свайпы, лайки, чаты и карта людей рядом.",
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground font-light">…</p>
        </div>
      }
    >
      <AppShell />
    </Suspense>
  )
}
