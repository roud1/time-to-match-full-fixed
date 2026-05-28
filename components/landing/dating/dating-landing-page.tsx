import "@/app/dating-landing.css"

import { DatingAiConnectionSection } from "@/components/landing/dating/dating-ai-connection-section"
import { DatingConnectionSection } from "@/components/landing/dating/dating-connection-section"
import { DatingEmotionalSection } from "@/components/landing/dating/dating-emotional-section"
import { DatingHowSection } from "@/components/landing/dating/dating-how-section"
import { DatingLandingFooter } from "@/components/landing/dating/dating-landing-footer"
import { DatingLandingHero } from "@/components/landing/dating/dating-landing-hero"
import { DatingLangSwitcher } from "@/components/landing/dating/dating-lang-switcher"
import { DatingLandingNav } from "@/components/landing/dating/dating-landing-nav"
import { DatingParallaxBg } from "@/components/landing/dating/dating-parallax-bg"

export function DatingLandingPage() {
  return (
    <>
      <main className="ttm-dating-landing">
        <DatingParallaxBg className="ttm-dating-landing__ambient" />
        <DatingLandingNav />
        <DatingLandingHero />
        <DatingAiConnectionSection />
        <DatingConnectionSection />
        <DatingHowSection />
        <DatingEmotionalSection />
        <DatingLandingFooter />
      </main>
      <DatingLangSwitcher />
    </>
  )
}
