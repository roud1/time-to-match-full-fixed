import { Navbar } from "@/client/components/navbar"
import { SparkLandingAmbient } from "@/client/components/landing/spark-landing-ambient"
import { SparkLandingHero } from "@/client/components/landing/spark-landing-hero"
import { SparkLandingRules } from "@/client/components/landing/spark-landing-rules"
import { SparkLandingShowcase } from "@/client/components/landing/spark-landing-showcase"
import { SparkLandingTrust } from "@/client/components/landing/spark-trust-glass"
import { SparkLandingFooter } from "@/client/components/landing/spark-landing-footer"

export function SparkLandingPage() {
  return (
    <main className="spark-landing spark-landing--cinematic spark-landing--premium-type">
      <SparkLandingAmbient />
      <Navbar variant="landing-minimal" />
      <SparkLandingHero />
      <SparkLandingRules />
      <SparkLandingShowcase />
      <SparkLandingTrust />
      <SparkLandingFooter />
    </main>
  )
}
