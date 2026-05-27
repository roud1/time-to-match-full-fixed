"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { isLoggedIn } from "@/lib/user-profile"

const COPY = {
  title: "Время — твой главный союзник. Не теряй его зря",
  subtitle: "Анкеты исчезают через 72 часа, мэтчи живут 24. Цени каждое мгновение",
  cta: "Найти искру",
} as const

export function SparkLandingHero() {
  const reduce = useReducedMotion()
  const [href, setHref] = useState("/register")

  useEffect(() => {
    setHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="spark-landing__hero" aria-labelledby="spark-landing-title">
      <motion.h1
        id="spark-landing-title"
        className="spark-landing__title"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {COPY.title}
      </motion.h1>
      <motion.p
        className="spark-landing__subtitle"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {COPY.subtitle}
      </motion.p>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={href} className="spark-landing__cta">
          {COPY.cta}
        </Link>
      </motion.div>
    </section>
  )
}
