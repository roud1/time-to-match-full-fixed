"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"

const RULES = [
  {
    icon: "⏳",
    title: "Анкета — 72 часа",
    text: "Твоя анкета исчезнет через трое суток. Это мотивирует быть настоящим и не откладывать",
  },
  {
    icon: "🔥",
    title: "Мэтч — 24 часа",
    text: "Когда вы понравились друг другу, у вас ровно сутки, чтобы начать диалог. Дальше — тишина",
  },
  {
    icon: "⛄",
    title: "Заморозка",
    text: "Особенный мэтч? Продли его ещё на 24 часа. У каждого есть один бесплатный шанс",
  },
] as const

export function SparkLandingRules() {
  return (
    <SparkReveal id="rules" className="spark-landing__section spark-landing__section--rules">
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Правила времени</h2>
        <p className="spark-landing__section-lead">Как это работает — три простых закона, которые держат ленту живой</p>
        <div className="spark-landing__rules-grid">
          {RULES.map((rule, index) => (
            <article
              key={rule.title}
              className="spark-landing__rule-card"
              style={{ animationDelay: `${index * 80}ms` }}
            >
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
