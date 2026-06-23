import { Suspense } from "react"
import dynamic from "next/dynamic"

const AppShell = dynamic(() => import("@/client/components/app/app-shell").then((m) => m.AppShell), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <p className="text-muted-foreground font-light text-sm">…</p>
    </div>
  ),
})

export const metadata = {
  title: "Лента — Time to Match",
  description: "Свайпы, лайки, чаты и карта людей рядом.",
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <p className="text-muted-foreground font-light">…</p>
        </div>
      }
    >
      <AppShell />
    </Suspense>
  )
}
