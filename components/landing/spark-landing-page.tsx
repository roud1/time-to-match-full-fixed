import { Navbar } from "@/components/navbar"
import { SparkLandingAmbient } from "@/components/landing/spark-landing-ambient"
import { SparkLandingHero } from "@/components/landing/spark-landing-hero"
import { SparkLandingFeatures } from "@/components/landing/spark-landing-features"
import { SparkLandingFooter } from "@/components/landing/spark-landing-footer"

export function SparkLandingPage() {
  return (
    <main className="spark-landing">
      <SparkLandingAmbient />
      <div className="spark-landing__main">
        <Navbar variant="landing-minimal" />
        <SparkLandingHero />
        <SparkLandingFeatures />
      </div>
      <SparkLandingFooter />
    </main>
  )
}
