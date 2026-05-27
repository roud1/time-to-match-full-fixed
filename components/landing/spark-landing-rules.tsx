"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"

const RULES = [
  {
    icon: "⏳",
    title: "Анкета — 72 часа",
    text: "Твоя анкета исчезнет через трое суток. Это мотивирует быть настоящим",
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
        <div className="spark-landing__rules-grid">
          {RULES.map((rule) => (
            <article key={rule.title} className="spark-landing__rule-card">
              <span className="spark-landing__rule-icon" aria-hidden>
                {rule.icon}
              </span>
              <h3 className="spark-landing__rule-title">{rule.title}</h3>
              <p className="spark-landing__rule-text">{rule.text}</p>
            </article>
          ))}
        </div>
      </div>
    </SparkReveal>
  )
}
