import { CinematicEntrance } from "@/components/cinematic-entrance"
import { LiveActivityFeed } from "@/components/live-activity-feed"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { OnboardingSection } from "@/components/onboarding-section"
import { ProfileCards } from "@/components/profile-cards"
import { SwipeUI } from "@/components/swipe-ui"
import { HowItWorks } from "@/components/how-it-works"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <CinematicEntrance />
      <Navbar />
      <LiveActivityFeed />
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
