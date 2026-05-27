"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"

const STEPS = [
  {
    icon: "⏳",
    title: "Анкета — 72 часа",
    text: "Твоя анкета исчезнет через трое суток. Это мотивирует быть настоящим.",
  },
  {
    icon: "🔥",
    title: "Мэтч — 24 часа",
    text: "У вас ровно сутки, чтобы начать диалог. Дальше — тишина.",
  },
  {
    icon: "⛄",
    title: "Заморозка",
    text: "Продли важный мэтч ещё на 24 часа.",
  },
] as const

export function SparkLandingHow() {
  return (
    <SparkReveal id="how" className="spark-landing__section spark-landing__section--how">
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Время делает общение честным</h2>
        <p className="spark-landing__section-lead">Как это работает — три шага, которые держат ленту живой</p>
        <ol className="spark-landing__steps-grid">
          {STEPS.map((step, index) => (
            <li key={step.title} className="spark-landing__step-card">
              <span className="spark-landing__step-num" aria-hidden>
                {index + 1}
              </span>
              <span className="spark-landing__step-icon" aria-hidden>
                {step.icon}
              </span>
              <h3 className="spark-landing__step-title">{step.title}</h3>
              <p className="spark-landing__step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </SparkReveal>
  )
}
