import "@/app/dating-landing.css"

import { fontLandingBody, fontLandingDisplay } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { DatingFeaturesSection } from "@/components/landing/dating/dating-features-section"
import { DatingFinalCtaSection } from "@/components/landing/dating/dating-final-cta-section"
import { DatingHowSection } from "@/components/landing/dating/dating-how-section"
import { DatingLandingFooter } from "@/components/landing/dating/dating-landing-footer"
import { DatingLandingHero } from "@/components/landing/dating/dating-landing-hero"
import { DatingLangSwitcher } from "@/components/landing/dating/dating-lang-switcher"
import { DatingLandingNav } from "@/components/landing/dating/dating-landing-nav"
import { DatingPricingSection } from "@/components/landing/dating/dating-pricing-section"
import { DatingProductPreviewSection } from "@/components/landing/dating/dating-product-preview-section"

export function DatingLandingPage() {
  return (
    <>
      <main
        className={cn(
          fontLandingDisplay.variable,
          fontLandingBody.variable,
          "ttm-dating-landing"
        )}
      >
        <DatingLandingNav />
        <DatingLandingHero />
        <DatingHowSection />
        <DatingProductPreviewSection />
        <DatingFeaturesSection />
        <DatingPricingSection />
        <DatingFinalCtaSection />
        <DatingLandingFooter />
      </main>
      <DatingLangSwitcher />
    </>
  )
}
