"use client"

import { Clock, Heart, MessageCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { DatingScrollReveal } from "@/client/components/landing/dating/dating-scroll-reveal"
import {
  DATING_PREVIEW_SWIPE_AGE,
  DATING_PREVIEW_SWIPE_KM,
  DATING_PREVIEW_SWIPE_PHOTO,
} from "@/client/components/landing/dating/dating-demo-profiles"
import { ProfilePhotoImage } from "@/client/components/ui/profile-photo-image"
import { useI18n } from "@/client/lib/i18n"

export function DatingProductPreviewSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  const panels = [
    {
      id: "swipe",
      label: t("datingPreviewSwipe"),
      icon: Heart,
      className: "ttm-dating-preview__panel--swipe",
    },
    {
      id: "chat",
      label: t("datingPreviewChat"),
      icon: MessageCircle,
      className: "ttm-dating-preview__panel--chat",
    },
    {
      id: "timer",
      label: t("datingPreviewTimer"),
      icon: Clock,
      className: "ttm-dating-preview__panel--timer",
    },
  ] as const

  return (
    <section id="preview" className="ttm-dating-section ttm-dating-preview" aria-labelledby="dating-preview-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow">{t("datingPreviewEyebrow")}</p>
          <h2 id="dating-preview-title" className="ttm-dating-section__title">
            {t("datingPreviewTitle")}
          </h2>
        </DatingScrollReveal>

        <div className="ttm-dating-preview__grid">
          {panels.map((panel, i) => {
            const Icon = panel.icon
            return (
              <motion.article
                key={panel.id}
                className={`ttm-dating-glass-card ttm-dating-preview__panel ${panel.className}`}
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="ttm-dating-preview__screen">
                  {panel.id === "swipe" && (
                    <>
                      <div className="ttm-dating-preview__profile-card">
                        <div className="ttm-dating-preview__profile-photo">
                          <ProfilePhotoImage
                            src={DATING_PREVIEW_SWIPE_PHOTO}
                            className="object-cover object-[center_18%]"
                            sizes="280px"
                          />
                        </div>
                        <div className="ttm-dating-preview__profile-meta">
                          <span>Anna, {DATING_PREVIEW_SWIPE_AGE}</span>
                          <span>{DATING_PREVIEW_SWIPE_KM} km</span>
                        </div>
                      </div>
                      <div className="ttm-dating-preview__swipe-actions">
                        <span className="ttm-dating-preview__swipe-btn ttm-dating-preview__swipe-btn--no">✕</span>
                        <span className="ttm-dating-preview__swipe-btn ttm-dating-preview__swipe-btn--yes">
                          <Heart size={18} aria-hidden />
                        </span>
                      </div>
                    </>
                  )}
                  {panel.id === "chat" && (
                    <div className="ttm-dating-preview__chat-ui">
                      <div className="ttm-dating-preview__chat-row ttm-dating-preview__chat-row--them">
                        {t("datingMockChatThem")}
                      </div>
                      <div className="ttm-dating-preview__chat-row ttm-dating-preview__chat-row--you">
                        {t("datingMockChatYou")}
                      </div>
                      <div className="ttm-dating-preview__chat-input" />
                    </div>
                  )}
                  {panel.id === "timer" && (
                    <div className="ttm-dating-preview__timer-ui">
                      <div className="ttm-dating-preview__timer-ring">
                        <span>72</span>
                      </div>
                      <p className="ttm-dating-preview__timer-countdown">23:14:08</p>
                      <p className="ttm-dating-preview__timer-hint">{t("datingHow3Text")}</p>
                    </div>
                  )}
                </div>
                <div className="ttm-dating-preview__label">
                  <Icon size={16} aria-hidden />
                  {panel.label}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
