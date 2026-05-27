import { Navbar } from "@/components/navbar"
import { SparkLandingAmbient } from "@/components/landing/spark-landing-ambient"
import { SparkLandingHero } from "@/components/landing/spark-landing-hero"
import { SparkLandingHow } from "@/components/landing/spark-landing-how"
import { SparkLandingShowcase } from "@/components/landing/spark-landing-showcase"
import { SparkLandingTrust } from "@/components/landing/spark-landing-trust"
import { SparkLandingFooter } from "@/components/landing/spark-landing-footer"

export function SparkLandingPage() {
  return (
    <main className="spark-landing">
      <SparkLandingAmbient />
      <Navbar variant="landing-minimal" />
      <SparkLandingHero />
      <SparkLandingHow />
      <SparkLandingShowcase />
      <SparkLandingTrust />
      <SparkLandingFooter />
    </main>
  )
}
