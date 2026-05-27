"use client"

import { motion, useReducedMotion } from "motion/react"

const FEATURES = [
  {
    icon: "⏳",
    title: "Анкета на 72 часа",
    text: "Заяви о себе, пока время не истекло. Твоя анкета живёт три дня — ровно столько, чтобы найти настоящий интерес",
  },
  {
    icon: "🔥",
    title: "Мэтч на 24 часа",
    text: "Не откладывай на потом. Если вы понравились друг другу, у вас есть сутки, чтобы начать диалог",
  },
  {
    icon: "❄️",
    title: "Заморозка моментов",
    text: "Особенный мэтч? Продли его на 24 часа и дайте себе больше времени",
  },
] as const

export function SparkLandingFeatures() {
  const reduce = useReducedMotion()

  return (
    <section className="spark-landing__features" aria-label="Ключевые особенности">
      {FEATURES.map((feature, index) => (
        <motion.article
          key={feature.title}
          className="spark-landing__card"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="spark-landing__card-icon" aria-hidden>
            {feature.icon}
          </span>
          <h2 className="spark-landing__card-title">{feature.title}</h2>
          <p className="spark-landing__card-text">{feature.text}</p>
        </motion.article>
      ))}
    </section>
  )
}
