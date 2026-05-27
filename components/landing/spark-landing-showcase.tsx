"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { SparkReveal } from "@/components/landing/spark-reveal"
import { SparkShowcaseMarquee } from "@/components/landing/spark-showcase-marquee"
import { isLoggedIn } from "@/lib/user-profile"

export function SparkLandingShowcase() {
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <SparkReveal
      id="showcase"
      className="spark-landing__section spark-landing__section--showcase"
      delay={0.04}
    >
      <div className="spark-landing__container spark-landing__container--showcase">
        <h2 className="spark-landing__section-title">Прямо сейчас анкеты ждут своего часа</h2>
        <p className="spark-landing__section-lead">
          Каждая из них исчезнет через 72 часа — не упусти тех, кто рядом
        </p>
        <SparkShowcaseMarquee />
        <div className="spark-landing__showcase-actions">
          <Link href={ctaHref} className="spark-landing__showcase-cta">
            Смотреть все анкеты
          </Link>
        </div>
      </div>
    </SparkReveal>
  )
}
