import "@/app/dating-landing.css"

import { DatingAiConnectionSection } from "@/components/landing/dating/dating-ai-connection-section"
import { DatingEmotionalSection } from "@/components/landing/dating/dating-emotional-section"
import { DatingMatchFlowSection } from "@/components/landing/dating/dating-match-flow-section"
import { DatingLandingFooter } from "@/components/landing/dating/dating-landing-footer"
import { DatingLandingHero } from "@/components/landing/dating/dating-landing-hero"
import { DatingLangSwitcher } from "@/components/landing/dating/dating-lang-switcher"
import { DatingLandingNav } from "@/components/landing/dating/dating-landing-nav"
import { DatingSocialProofSection } from "@/components/landing/dating/dating-social-proof-section"

export function DatingLandingPage() {
  return (
    <>
      <main className="ttm-dating-landing">
        <DatingLandingNav />
        <DatingLandingHero />
        <DatingSocialProofSection />
        <DatingMatchFlowSection />
        <DatingAiConnectionSection />
        <DatingEmotionalSection />
        <DatingLandingFooter />
      </main>
      <DatingLangSwitcher />
    </>
  )
}
