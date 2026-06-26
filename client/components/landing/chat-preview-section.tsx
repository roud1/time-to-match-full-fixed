"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"

const MESSAGE_KEYS = [
  "ttmLandingChatMsg1",
  "ttmLandingChatMsg2",
  "ttmLandingChatMsg3",
] as const satisfies readonly TranslationKey[]

const MESSAGE_FROM = ["them", "you", "them"] as const

function useChatTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((s) => (s <= 0 ? initialSeconds : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [initialSeconds])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function ChatPreviewSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const timer = useChatTimer(6 * 3600 + 14 * 60 + 22)

  return (
    <section id="chat" className="ttm-landing-section" aria-labelledby="chat-title">
      <div className="ttm-landing-container ttm-landing-split">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-landing-eyebrow">{t("ttmLandingChatEyebrow")}</p>
          <h2 id="chat-title" className="ttm-landing-title ttm-landing-title--section">
            {t("ttmLandingChatTitle")}
          </h2>
          <p className="ttm-landing-sub" style={{ marginTop: "1rem" }}>
            {t("ttmLandingChatSub")}
          </p>
        </motion.div>

        <motion.div
          className="ttm-landing-glass ttm-landing-glass--glow ttm-landing-chat"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="ttm-landing-chat__header">
            <div className="ttm-landing-chat__peer">
              <Image
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&q=85"
                alt=""
                width={40}
                height={40}
                className="ttm-landing-chat__avatar"
              />
              <div>
                <p className="ttm-landing-chat__name">{t("ttmLandingChatPeerName")}</p>
                <p className="ttm-landing-chat__status">{t("ttmLandingChatOnline")}</p>
              </div>
            </div>
            <div className="ttm-landing-chat__timer-badge">
              <span className="ttm-landing-chat__timer-label">{t("ttmLandingChatExpiresIn")}</span>
              <span className="ttm-landing-chat__timer-value" aria-live="polite">
                {timer}
              </span>
            </div>
          </header>

          <div className="ttm-landing-chat__messages">
            {MESSAGE_KEYS.map((key, i) => (
              <motion.div
                key={key}
                className={`ttm-landing-chat__bubble ttm-landing-chat__bubble--${MESSAGE_FROM[i]}`}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
              >
                {t(key)}
              </motion.div>
            ))}
          </div>

          <p className="ttm-landing-chat__urgency">{t("ttmLandingChatUrgency")}</p>
        </motion.div>
      </div>
    </section>
  )
}
