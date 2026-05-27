"use client"

import dynamic from "next/dynamic"
import { CinematicEntrance } from "@/components/cinematic-entrance"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ConnectionEvolutionSection } from "@/components/landing/connection-evolution-section"
import { SectionPlaceholder } from "@/components/ui/section-placeholder"
import { cn } from "@/lib/utils"

const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { loading: () => <SectionPlaceholder className="min-h-[360px]" /> }
)

const CTASection = dynamic(
  () => import("@/components/cta-section").then((m) => m.CTASection),
  { loading: () => <SectionPlaceholder className="min-h-[200px]" /> }
)

const Footer = dynamic(() => import("@/components/footer").then((m) => m.Footer))

function LandingDivider() {
  return (
    <div className="landing-divider relative z-[1] mx-auto max-w-6xl px-5 sm:px-8" aria-hidden>
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--tile-border)] to-transparent" />
    </div>
  )
}

export function HomePage() {
  return (
    <main className="landing-page landing-experience min-h-screen text-foreground relative">
      <CinematicEntrance />
      <Navbar variant="landing" />

      <HeroSection />

      <LandingDivider />

      <section className={cn("landing-section relative z-[1]")}>
        <ConnectionEvolutionSection />
      </section>

      <LandingDivider />

      <section className={cn("landing-section relative z-[1]")}>
        <HowItWorks />
      </section>

      <LandingDivider />

      <section className={cn("landing-section landing-section--cta relative z-[1]")}>
        <CTASection />
      </section>

      <Footer />
    </main>
  )
}
