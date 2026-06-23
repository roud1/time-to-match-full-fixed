import "@/app/ai-landing.css"

import { AiCapabilitiesSection } from "@/client/components/landing/ai/ai-capabilities-section"
import { AiConnectionScoreSection } from "@/client/components/landing/ai/ai-connection-score-section"
import { AiFinalCtaSection } from "@/client/components/landing/ai/ai-final-cta-section"
import { AiLandingHero } from "@/client/components/landing/ai/ai-landing-hero"
import { AiLandingNav } from "@/client/components/landing/ai/ai-landing-nav"
import { AiLiveDemoSection } from "@/client/components/landing/ai/ai-live-demo-section"
import { AiSocialProofSection } from "@/client/components/landing/ai/ai-social-proof-section"
import { AiThinkingSection } from "@/client/components/landing/ai/ai-thinking-section"
import { AiTrustSection } from "@/client/components/landing/ai/ai-trust-section"
import { AiUrgencySection } from "@/client/components/landing/ai/ai-urgency-section"
import { AiValueSection } from "@/client/components/landing/ai/ai-value-section"

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
