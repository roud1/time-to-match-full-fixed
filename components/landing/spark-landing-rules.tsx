"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"
import { SparkStagger } from "@/components/landing/spark-stagger"
import { SparkTiltCard } from "@/components/landing/spark-tilt-card"

const RULES = [
  {
    icon: "✨",
    title: "Будь собой",
    text: "Честный профиль и атмосфера — так тебя почувствуют в ленте",
  },
  {
    icon: "🔥",
    title: "Мэтч — 24 часа",
    text: "У вас ровно сутки, чтобы начать диалог. Потом — тишина",
  },
  {
    icon: "⛄",
    title: "Заморозка",
    text: "Продли особенный мэтч ещё на 24 часа. Бесплатно раз в сутки",
  },
] as const

export function SparkLandingRules() {
  return (
    <SparkReveal id="rules" className="spark-landing__section spark-landing__section--rules">
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Правила времени</h2>
        <SparkStagger className="spark-landing__rules-grid" stagger={0.12}>
          {RULES.map((rule) => (
            <SparkTiltCard key={rule.title}>
              <article className="spark-landing__rule-card spark-landing__rule-card--tilt">
                <span className="spark-landing__rule-icon" aria-hidden>
                  {rule.icon}
                </span>
                <h3 className="spark-landing__rule-title">{rule.title}</h3>
                <p className="spark-landing__rule-text">{rule.text}</p>
              </article>
            </SparkTiltCard>
          ))}
        </SparkStagger>
      </div>
    </SparkReveal>
  )
}
