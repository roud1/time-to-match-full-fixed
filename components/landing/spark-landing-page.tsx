import { Navbar } from "@/components/navbar"
import { SparkLandingAmbient } from "@/components/landing/spark-landing-ambient"
import { SparkLandingHero } from "@/components/landing/spark-landing-hero"
import { SparkLandingRules } from "@/components/landing/spark-landing-rules"
import { SparkLandingShowcase } from "@/components/landing/spark-landing-showcase"
import { SparkLandingWhy } from "@/components/landing/spark-landing-why"
import { SparkLandingFooter } from "@/components/landing/spark-landing-footer"

export function SparkLandingPage() {
  return (
    <main className="spark-landing">
      <SparkLandingAmbient />
      <Navbar variant="landing-minimal" />
      <SparkLandingHero />
      <SparkLandingRules />
      <SparkLandingShowcase />
      <SparkLandingWhy />
      <SparkLandingFooter />
    </main>
  )
}
