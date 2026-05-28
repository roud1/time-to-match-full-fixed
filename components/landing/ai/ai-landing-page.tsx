import "@/app/ai-landing.css"

import { AiCapabilitiesSection } from "@/components/landing/ai/ai-capabilities-section"
import { AiConnectionScoreSection } from "@/components/landing/ai/ai-connection-score-section"
import { AiFinalCtaSection } from "@/components/landing/ai/ai-final-cta-section"
import { AiLandingHero } from "@/components/landing/ai/ai-landing-hero"
import { AiLandingNav } from "@/components/landing/ai/ai-landing-nav"
import { AiLiveDemoSection } from "@/components/landing/ai/ai-live-demo-section"
import { AiSocialProofSection } from "@/components/landing/ai/ai-social-proof-section"
import { AiThinkingSection } from "@/components/landing/ai/ai-thinking-section"
import { AiTrustSection } from "@/components/landing/ai/ai-trust-section"
import { AiUrgencySection } from "@/components/landing/ai/ai-urgency-section"
import { AiValueSection } from "@/components/landing/ai/ai-value-section"

export function AiLandingPage() {
  return (
    <main className="ttm-ai-landing">
      <AiLandingNav />
      <AiLandingHero />
      <AiCapabilitiesSection />
      <AiValueSection />
      <AiConnectionScoreSection />
      <AiTrustSection />
      <AiThinkingSection />
      <AiLiveDemoSection />
      <AiSocialProofSection />
      <AiUrgencySection />
      <AiFinalCtaSection />
      <footer className="ttm-ai-footer">
        <p>© {new Date().getFullYear()} Time to Match · AI Connection Engine</p>
      </footer>
    </main>
  )
}
