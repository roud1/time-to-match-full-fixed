"use client"

import { Clock, Heart, MessageCircle, Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"

export function DatingAppMockup() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <div className="ttm-dating-mockup" aria-label={t("datingHeroCardsAria")}>
      <div className="ttm-dating-mockup__glow" aria-hidden />
      <div className="ttm-dating-mockup__phone">
        <div className="ttm-dating-mockup__notch" aria-hidden />
        <div className="ttm-dating-mockup__screen">
          {/* Swipe card */}
          <motion.div
            className="ttm-dating-mockup__card ttm-dating-mockup__card--swipe"
            initial={reduce ? false : { opacity: 0, x: 20, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-dating-mockup__card-photo" />
            <div className="ttm-dating-mockup__card-info">
              <span className="ttm-dating-mockup__card-name">{t("datingProfileNameSofia")}, 26</span>
              <span className="ttm-dating-mockup__card-meta">
                <Sparkles size={12} aria-hidden />
                87% {t("datingConnectionScoreCaption").toLowerCase()}
              </span>
            </div>
            <div className="ttm-dating-mockup__card-actions">
              <span className="ttm-dating-mockup__action ttm-dating-mockup__action--pass" aria-hidden>
                ✕
              </span>
              <span className="ttm-dating-mockup__action ttm-dating-mockup__action--like">
                <Heart size={16} aria-hidden />
              </span>
            </div>
          </motion.div>

          {/* Chat preview */}
          <motion.div
            className="ttm-dating-mockup__chat"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-dating-mockup__chat-header">
              <MessageCircle size={14} aria-hidden />
              <span>{t("datingPreviewChat")}</span>
            </div>
            <div className="ttm-dating-mockup__bubble ttm-dating-mockup__bubble--them">
              {t("datingMockChatThem")}
            </div>
            <div className="ttm-dating-mockup__bubble ttm-dating-mockup__bubble--you">
              {t("datingMockChatYou")}
            </div>
          </motion.div>

          {/* Timer pill */}
          <motion.div
            className="ttm-dating-mockup__timer"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Clock size={14} aria-hidden />
            <span className="ttm-dating-mockup__timer-value">18:42:07</span>
            <span className="ttm-dating-mockup__timer-label">{t("datingPreviewTimer")}</span>
          </motion.div>
        </div>
      </div>

      {/* Floating secondary phone */}
      <motion.div
        className="ttm-dating-mockup__phone ttm-dating-mockup__phone--secondary"
        initial={reduce ? false : { opacity: 0, y: 24, x: -12 }}
        animate={{ opacity: 0.85, y: 0, x: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <div className="ttm-dating-mockup__notch" />
        <div className="ttm-dating-mockup__screen ttm-dating-mockup__screen--match">
          <div className="ttm-dating-mockup__match-ring">
            <Heart size={28} aria-hidden />
          </div>
          <p className="ttm-dating-mockup__match-text">{t("datingHeroMatchMoment")}</p>
        </div>
      </motion.div>
    </div>
  )
}
