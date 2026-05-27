"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"

const TRUST_ITEMS = [
  {
    icon: "✅",
    title: "Фото проверяются",
    text: "Верификация по жесту отсекает фейки",
  },
  {
    icon: "🔒",
    title: "Данные защищены",
    text: "Шифрование и бережное хранение профиля",
  },
  {
    icon: "👥",
    title: "10 000+ активных пользователей",
    text: "Лента обновляется каждый день",
  },
] as const

export function SparkLandingTrust() {
  return (
    <SparkReveal
      id="trust"
      className="spark-landing__section spark-landing__section--trust"
      delay={0.06}
    >
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Почему нам доверяют</h2>
        <ul className="spark-landing__trust-grid">
          {TRUST_ITEMS.map((item) => (
            <li key={item.title} className="spark-landing__trust-card">
              <span className="spark-landing__trust-icon" aria-hidden>
                {item.icon}
              </span>
              <h3 className="spark-landing__trust-title">{item.title}</h3>
              <p className="spark-landing__trust-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </SparkReveal>
  )
}
