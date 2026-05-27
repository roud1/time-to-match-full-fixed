"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"

const PILLARS = [
  {
    icon: "✦",
    title: "Нет бесконечным анкетам",
    text: "Ты видишь только актуальных людей",
  },
  {
    icon: "⏱",
    title: "Нет упущенным мэтчам",
    text: "Ты не забудешь написать — таймер напомнит",
  },
  {
    icon: "✓",
    title: "Нет фальшивым фото",
    text: "Верификация по жесту подтверждает реальность",
  },
] as const

export function SparkLandingWhy() {
  return (
    <SparkReveal
      id="why"
      className="spark-landing__section spark-landing__section--why"
      delay={0.05}
    >
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Время делает общение честным</h2>
        <p className="spark-landing__section-lead">Почему это работает — когда сроки реальны, исчезают пустые игры</p>
        <div className="spark-landing__why-grid">
          {PILLARS.map((item) => (
            <div key={item.title} className="spark-landing__why-item">
              <span className="spark-landing__why-icon" aria-hidden>
                {item.icon}
              </span>
              <h3 className="spark-landing__why-title">{item.title}</h3>
              <p className="spark-landing__why-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SparkReveal>
  )
}
