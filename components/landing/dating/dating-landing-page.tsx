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

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Time to Match",
      url: siteUrl,
      logo: `${siteUrl}/brand/ttm-logo-full.png`,
    },
    {
      "@type": "WebApplication",
      name: "Time to Match",
      url: siteUrl,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      description:
        "Premium dating where every match lives for 24 hours. Connect now or lose them forever.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
}

export function DatingLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
