"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function LoginLiveStatus() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [online, setOnline] = useState(128)
  const [score, setScore] = useState(87)
  const [countdown, setCountdown] = useState(23 * 3600 + 41 * 60 + 12)

  const messages = useMemo(
    () => [
      t("loginLiveOnline").replace("{count}", String(online)),
      t("loginLiveMatch").replace("{min}", "12"),
      t("loginLiveScore").replace("{score}", String(score)),
      t("loginLiveTimer").replace("{time}", formatCountdown(countdown)),
    ],
    [t, online, score, countdown]
  )

  useEffect(() => {
    const cycleId = window.setInterval(() => {
      setIndex((value) => (value + 1) % messages.length)
    }, 3200)
    return () => window.clearInterval(cycleId)
  }, [messages.length])

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 23 * 3600 + 41 * 60 + 12))
      if (Math.random() > 0.6) {
        setOnline((value) => Math.min(156, Math.max(112, value + (Math.random() > 0.5 ? 1 : -1))))
      }
      if (Math.random() > 0.7) {
        setScore((value) => Math.min(89, Math.max(85, value + (Math.random() > 0.5 ? 1 : -1))))
      }
    }, 1000)
    return () => window.clearInterval(tickId)
  }, [])

  return (
    <div className="ttm-login-live" role="status" aria-live="polite">
      <span className="ttm-login-live__dot" aria-hidden />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className="ttm-login-live__text"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
