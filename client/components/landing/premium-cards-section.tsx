"use client"

import { motion, useReducedMotion } from "motion/react"
import { SparkDemoProfileCard } from "@/client/components/landing/spark-demo-profile-card"
import { SPARK_DEMO_PROFILES } from "@/client/components/landing/spark-demo-profiles"

export function PremiumCardsSection() {
  const reduce = useReducedMotion()
  const featured = SPARK_DEMO_PROFILES.slice(0, 4)

  return (
    <section id="cards" className="ttm-premium-section ttm-premium-cards" aria-labelledby="cards-title">
      <div className="ttm-premium-container">
        <p className="ttm-premium-section__eyebrow">Discover</p>
        <h2 id="cards-title" className="ttm-premium-section__title">
          Swipe. Feel it. Before time runs out.
        </h2>
        <div className="ttm-premium-cards__grid">
          {featured.map((profile, i) => (
            <motion.div
              key={profile.name}
              className="ttm-premium-cards__item"
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <SparkDemoProfileCard profile={profile} interactive className="ttm-premium-profile-card" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
