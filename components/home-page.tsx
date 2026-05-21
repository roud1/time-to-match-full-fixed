"use client"

import dynamic from "next/dynamic"
import { CinematicEntrance } from "@/components/cinematic-entrance"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { SectionPlaceholder } from "@/components/ui/section-placeholder"
import { cn } from "@/lib/utils"

const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { loading: () => <SectionPlaceholder className="min-h-[360px]" /> }
)

const SwipeUI = dynamic(
  () => import("@/components/swipe-ui").then((m) => m.SwipeUI),
  { loading: () => <SectionPlaceholder className="min-h-[440px]" /> }
)

const CTASection = dynamic(
  () => import("@/components/cta-section").then((m) => m.CTASection),
  { loading: () => <SectionPlaceholder className="min-h-[200px]" /> }
)

const Footer = dynamic(() => import("@/components/footer").then((m) => m.Footer))

function LandingDivider() {
  return (
    <div className="landing-divider mx-auto max-w-6xl px-5 sm:px-8" aria-hidden>
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  )
}

export function HomePage() {
  return (
    <main className="landing-page min-h-screen bg-[#050506] text-foreground">
      <CinematicEntrance />
      <Navbar />

      <HeroSection />

      <LandingDivider />

      <section className={cn("landing-section")}>
        <HowItWorks />
      </section>

      <LandingDivider />

      <section className={cn("landing-section")}>
        <SwipeUI />
      </section>

      <LandingDivider />

      <section className={cn("landing-section landing-section--cta")}>
        <CTASection />
      </section>

      <Footer />
    </main>
  )
}
