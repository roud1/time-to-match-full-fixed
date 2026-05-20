"use client"

import dynamic from "next/dynamic"
import { CinematicEntrance } from "@/components/cinematic-entrance"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { SectionPlaceholder } from "@/components/ui/section-placeholder"

const OnboardingSection = dynamic(
  () => import("@/components/onboarding-section").then((m) => m.OnboardingSection),
  { loading: () => <SectionPlaceholder className="min-h-[280px] my-8" /> }
)

const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { loading: () => <SectionPlaceholder className="min-h-[400px] my-8" /> }
)

const ProfileCards = dynamic(
  () => import("@/components/profile-cards").then((m) => m.ProfileCards),
  { loading: () => <SectionPlaceholder className="min-h-[520px] my-8" /> }
)

const SwipeUI = dynamic(
  () => import("@/components/swipe-ui").then((m) => m.SwipeUI),
  { loading: () => <SectionPlaceholder className="min-h-[480px] my-8" /> }
)

const CTASection = dynamic(
  () => import("@/components/cta-section").then((m) => m.CTASection),
  { loading: () => <SectionPlaceholder className="min-h-[200px] my-8" /> }
)

const Footer = dynamic(() => import("@/components/footer").then((m) => m.Footer))

export function HomePage() {
  return (
    <main className="min-h-screen bg-[#070707]">
      <CinematicEntrance />
      <Navbar />
      <HeroSection />
      <OnboardingSection />
      <HowItWorks />
      <ProfileCards />
      <SwipeUI />
      <CTASection />
      <Footer />
    </main>
  )
}
