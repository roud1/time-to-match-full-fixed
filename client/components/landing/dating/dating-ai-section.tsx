"use client"

import { motion, useReducedMotion } from "motion/react"
import { MessageCircle, Sparkles, Users } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"

export function DatingAiSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section className="ttm-dating-section ttm-dating-ai" aria-labelledby="dating-ai-title">
      <div className="ttm-dating-container">
        <motion.div
          className="ttm-dating-ai__card"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ttm-dating-ai__icons" aria-hidden>
            <span className="ttm-dating-ai__icon">
              <MessageCircle size={20} />
            </span>
            <span className="ttm-dating-ai__icon">
              <Sparkles size={20} />
            </span>
            <span className="ttm-dating-ai__icon">
              <Users size={20} />
            </span>
          </div>
          <p className="ttm-dating-section__eyebrow">{t("datingAiEyebrow")}</p>
          <h2 id="dating-ai-title" className="ttm-dating-ai__title">
            {t("datingAiConnectionTitle")}
          </h2>
          <p className="ttm-dating-ai__hint">{t("datingAiScoreHint")}</p>
        </motion.div>
      </div>
    </section>
  )
}
