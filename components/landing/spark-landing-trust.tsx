"use client"

import { SparkReveal } from "@/components/landing/spark-reveal"

const TRUST_STRIP = [
  { icon: "✅", label: "Фото проверяются" },
  { icon: "🔒", label: "Данные защищены" },
  { icon: "👥", label: "10 000+ активных пользователей" },
] as const

export function SparkLandingTrust() {
  return (
    <SparkReveal
      id="trust"
      className="spark-landing__section spark-landing__section--trust-strip"
      delay={0.06}
    >
      <div className="spark-landing__container">
        <ul className="spark-landing__trust-strip" role="list">
          {TRUST_STRIP.map((item) => (
            <li key={item.label} className="spark-landing__trust-strip-item">
              <span className="spark-landing__trust-strip-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="spark-landing__trust-strip-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </SparkReveal>
  )
}
