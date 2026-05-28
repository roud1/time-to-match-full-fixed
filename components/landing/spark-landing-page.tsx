import { Navbar } from "@/components/navbar"
import { SparkLandingAmbient } from "@/components/landing/spark-landing-ambient"
import { SparkLandingHero } from "@/components/landing/spark-landing-hero"
import { SparkLandingRules } from "@/components/landing/spark-landing-rules"
import { SparkLandingShowcase } from "@/components/landing/spark-landing-showcase"
import { SparkLandingTrust } from "@/components/landing/spark-trust-glass"
import { SparkLandingFooter } from "@/components/landing/spark-landing-footer"

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
