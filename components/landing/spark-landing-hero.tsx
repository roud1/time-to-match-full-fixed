"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { isLoggedIn } from "@/lib/user-profile"

export function SparkLandingHero() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="spark-landing__hero" aria-labelledby="spark-hero-line1">
      <div className="spark-landing__hero-inner">
        <motion.p
          id="spark-hero-line1"
          className="spark-landing__headline spark-landing__headline--primary"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          72 часа, чтобы засиять
        </motion.p>
        <motion.p
          className="spark-landing__headline spark-landing__headline--accent"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          24 часа, чтобы не потерять
        </motion.p>
        <motion.p
          className="spark-landing__hero-sub"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          Дейтинг, где время решает всё. Анкеты и мэтчи живут по своим правилам — не упусти момент
        </motion.p>
        <motion.div
          className="spark-landing__hero-actions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={ctaHref} className="spark-landing__cta">
            <Sparkles className="spark-landing__cta-icon" aria-hidden strokeWidth={1.75} />
            Создать анкету
          </Link>
          <p className="spark-landing__hero-login">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="spark-landing__hero-login-link">
              Войти
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="spark-landing__hero-scroll-hint" aria-hidden>
        <span className="spark-landing__hero-scroll-dot" />
      </div>
    </section>
  )
}
