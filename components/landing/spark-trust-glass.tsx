"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { SparkReveal } from "@/components/landing/spark-reveal"
import { SparkStagger } from "@/components/landing/spark-stagger"
import { SparkTiltCard } from "@/components/landing/spark-tilt-card"
import { cn } from "@/lib/utils"

const ITEMS = [
  {
    id: "verify",
    label: "Фото проверяются",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="spark-trust-svg" aria-hidden>
        <motion.path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
    ),
  },
  {
    id: "lock",
    label: "Данные защищены",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="spark-trust-svg" aria-hidden>
        <motion.rect
          x="5"
          y="11"
          width="14"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth={1.75}
          initial={{ pathLength: 0, opacity: 0.3 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.path
          d="M8 11V8a4 4 0 118 0v3"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
        />
      </svg>
    ),
  },
  {
    id: "users",
    label: "10 000+ активных пользователей",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="spark-trust-svg" aria-hidden>
        <motion.circle
          cx="9"
          cy="8"
          r="3.5"
          stroke="currentColor"
          strokeWidth={1.75}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        />
        <motion.path
          d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.circle
          cx="17"
          cy="9"
          r="2.5"
          stroke="currentColor"
          strokeWidth={1.75}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
        />
      </svg>
    ),
  },
] as const

function TrustGlassCard({
  label,
  icon,
  index,
}: {
  label: string
  icon: ReactNode
  index: number
}) {
  const reduce = useReducedMotion()

  return (
    <SparkTiltCard maxTilt={8}>
      <motion.article
        className={cn("spark-trust-glass")}
        initial={reduce ? false : { opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
      >
        <motion.div
          className="spark-trust-glass__icon-wrap"
          initial={reduce ? false : { scale: 0.85 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: index * 0.06 }}
        >
          {icon}
        </motion.div>
        <p className="spark-trust-glass__label">{label}</p>
      </motion.article>
    </SparkTiltCard>
  )
}

export function SparkLandingTrust() {
  return (
    <SparkReveal
      id="trust"
      className="spark-landing__section spark-landing__section--trust-glass"
      delay={0.06}
    >
      <div className="spark-landing__container">
        <h2 className="spark-landing__section-title">Почему нам доверяют</h2>
        <SparkStagger className="spark-trust-glass__grid" stagger={0.12}>
          {ITEMS.map((item, index) => (
            <TrustGlassCard key={item.id} label={item.label} icon={item.icon} index={index} />
          ))}
        </SparkStagger>
      </div>
    </SparkReveal>
  )
}
