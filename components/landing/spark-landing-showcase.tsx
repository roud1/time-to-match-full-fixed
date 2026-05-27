"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { SparkReveal } from "@/components/landing/spark-reveal"
import {
  SparkDemoProfileCard,
  type SparkDemoProfile,
} from "@/components/landing/spark-demo-profile-card"
import { isLoggedIn } from "@/lib/user-profile"

const DEMO_PROFILES: SparkDemoProfile[] = [
  {
    name: "Анна",
    age: 24,
    compatibility: 82,
    timerLabel: "Осталось 7 часов",
    initials: "А",
    photoGradient: "linear-gradient(145deg, #fda4af 0%, #f9a8d4 45%, #c4b5fd 100%)",
    urgent: true,
  },
  {
    name: "Максим",
    age: 27,
    compatibility: 65,
    timerLabel: "Осталось 4 часа",
    initials: "М",
    photoGradient: "linear-gradient(160deg, #7dd3fc 0%, #38bdf8 50%, #6366f1 100%)",
    urgent: true,
  },
  {
    name: "Ева",
    age: 22,
    compatibility: 91,
    timerLabel: "Осталось 48 часов",
    verified: true,
    initials: "Е",
    photoGradient: "linear-gradient(155deg, #fcd34d 0%, #fb923c 40%, #f472b6 100%)",
  },
  {
    name: "Дмитрий",
    age: 29,
    compatibility: 58,
    timerLabel: "Осталось 22 часа",
    initials: "Д",
    photoGradient: "linear-gradient(150deg, #6ee7b7 0%, #2dd4bf 55%, #0d9488 100%)",
  },
  {
    name: "София",
    age: 25,
    compatibility: 76,
    timerLabel: "Осталось 15 часов",
    verified: true,
    initials: "С",
    photoGradient: "linear-gradient(140deg, #e9d5ff 0%, #a78bfa 50%, #ec4899 100%)",
  },
  {
    name: "Артём",
    age: 26,
    compatibility: 43,
    timerLabel: "Осталось 3 часа",
    initials: "А",
    photoGradient: "linear-gradient(165deg, #94a3b8 0%, #64748b 45%, #334155 100%)",
    urgent: true,
  },
]

export function SparkLandingShowcase() {
  const reduce = useReducedMotion()
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
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Прямо сейчас анкеты ждут своего часа</h2>
        <p className="spark-landing__section-lead">
          Каждая из них исчезнет через 72 часа — не упусти тех, кто рядом
        </p>

        <div className="spark-landing__showcase-track" role="presentation">
          {DEMO_PROFILES.map((profile, index) => (
            <motion.div
              key={profile.name}
              className="spark-landing__showcase-item"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SparkDemoProfileCard profile={profile} />
            </motion.div>
          ))}
        </div>

        <div className="spark-landing__showcase-actions">
          <Link href={ctaHref} className="spark-landing__showcase-cta">
            Смотреть все анкеты
          </Link>
        </div>
      </div>
    </SparkReveal>
  )
}
