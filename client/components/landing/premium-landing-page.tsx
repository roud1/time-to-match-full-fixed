import { PremiumCardsSection } from "@/client/components/landing/premium-cards-section"
import { PremiumEmotionalSection } from "@/client/components/landing/premium-emotional-section"
import { PremiumFinalCtaSection } from "@/client/components/landing/premium-final-cta-section"
import { PremiumHowSection } from "@/client/components/landing/premium-how-section"
import { PremiumLandingHero } from "@/client/components/landing/premium-landing-hero"
import { PremiumLandingNav } from "@/client/components/landing/premium-landing-nav"
import { PremiumPulseSection } from "@/client/components/landing/premium-pulse-section"

export function PremiumLandingPage() {
  return (
    <main className="ttm-premium-landing">
      <div className="ttm-premium-landing__ambient" aria-hidden />
      <PremiumLandingNav />
      <PremiumLandingHero />
      <PremiumPulseSection />
      <PremiumHowSection />
      <PremiumEmotionalSection />
      <PremiumCardsSection />
      <PremiumFinalCtaSection />
      <footer className="ttm-premium-footer">
        <p>© {new Date().getFullYear()} Time to Match</p>
      </footer>
    </main>
  )
}
