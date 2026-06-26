"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"

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
  return { label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, seconds }
}

const MESSAGE_KEYS = [
  { from: "them" as const, key: "ttmLandingChatMsg1" as const, time: "2:14 PM" },
  { from: "you" as const, key: "ttmLandingChatMsg2" as const, time: "2:15 PM" },
  { from: "them" as const, key: "ttmLandingChatMsg3" as const, time: "2:16 PM" },
]

export function ChatPreviewSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const { label: timer, seconds } = useChatTimer(6 * 3600 + 14 * 60 + 22)
  const [visibleMessages, setVisibleMessages] = useState(0)
  const urgent = seconds < 7 * 3600

  useEffect(() => {
    if (visibleMessages >= MESSAGE_KEYS.length) return
    const delay = visibleMessages === 0 ? 800 : 1200
    const id = window.setTimeout(() => setVisibleMessages((v) => v + 1), delay)
    return () => window.clearTimeout(id)
  }, [visibleMessages])

  return (
    <section id="chat" className="ttm-section ttm-section--alt" aria-labelledby="chat-title">
      <div className="ttm-container ttm-split">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="ttm-eyebrow">{t("ttmLandingChatEyebrow")}</span>
          <h2 id="chat-title" className="ttm-title ttm-title--section">
            {t("ttmLandingChatTitle")}
          </h2>
          <p className="ttm-sub" style={{ marginTop: "1rem" }}>
            {t("ttmLandingChatSub")}
          </p>
        </motion.div>

        <motion.div
          className="ttm-glass ttm-glass--glow ttm-chat"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="ttm-chat__header">
            <div className="ttm-chat__peer">
              <div className="ttm-chat__avatar" />
              <div>
                <p className="ttm-chat__name">{t("ttmLandingChatPeerName")}</p>
                <p className="ttm-chat__status">
                  <span className="ttm-chat__status-dot" />
                  {t("ttmLandingChatOnline")}
                </p>
              </div>
            </div>
            <motion.div
              className={`ttm-chat__timer-badge${urgent ? " ttm-chat__timer-badge--urgent" : ""}`}
              animate={urgent && !reduce ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <span className="ttm-chat__timer-label">{t("ttmLandingChatExpiresIn")}</span>
              <span className="ttm-chat__timer-value" aria-live="polite">
                {timer}
              </span>
            </motion.div>
          </header>

          <div className="ttm-chat__messages">
            {MESSAGE_KEYS.slice(0, visibleMessages).map((msg, i) => (
              <motion.div
                key={msg.key}
                className={`ttm-chat__bubble ttm-chat__bubble--${msg.from}`}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="ttm-chat__bubble-text">{t(msg.key)}</p>
                <span className="ttm-chat__bubble-time">{msg.time}</span>
              </motion.div>
            ))}
            {visibleMessages < MESSAGE_KEYS.length && (
              <motion.div
                className="ttm-chat__typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="ttm-chat__typing-dot" />
                <span className="ttm-chat__typing-dot" />
                <span className="ttm-chat__typing-dot" />
              </motion.div>
            )}
          </div>

          <motion.p
            className="ttm-chat__urgency"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {t("ttmLandingChatReplyUrgency")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
