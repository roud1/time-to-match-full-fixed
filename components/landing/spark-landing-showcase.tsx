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

/** Unsplash portraits (demo only, not real app users). */
const DEMO_PROFILES: SparkDemoProfile[] = [
  {
    name: "Анна",
    age: 24,
    compatibility: 82,
    timerLabel: "Осталось 7 часов",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&h=600&fit=crop&q=85",
    urgent: true,
  },
  {
    name: "Максим",
    age: 27,
    compatibility: 65,
    timerLabel: "Осталось 4 часа",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=600&fit=crop&q=85",
    urgent: true,
  },
  {
    name: "Ева",
    age: 22,
    compatibility: 91,
    timerLabel: "Осталось 48 часов",
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=600&fit=crop&q=85",
  },
  {
    name: "Дмитрий",
    age: 29,
    compatibility: 58,
    timerLabel: "Осталось 22 часа",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&h=600&fit=crop&q=85",
  },
  {
    name: "София",
    age: 25,
    compatibility: 76,
    timerLabel: "Осталось 15 часов",
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=480&h=600&fit=crop&q=85",
  },
  {
    name: "Артём",
    age: 26,
    compatibility: 43,
    timerLabel: "Осталось 3 часа",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=480&h=600&fit=crop&q=85",
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
