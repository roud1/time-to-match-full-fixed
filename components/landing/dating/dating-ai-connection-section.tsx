"use client"

import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const SIGNAL_KEYS: TranslationKey[] = [
  "datingAiSignal1",
  "datingAiSignal2",
  "datingAiSignal3",
]

export function DatingAiConnectionSection() {
  const { t } = useI18n()

  return (
    <section id="ai" className="ttm-dating-section ttm-dating-section--compact ttm-dating-ai" aria-labelledby="dating-ai-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <div className="ttm-dating-ai__panel">
            <div className="ttm-dating-ai__analyze">
              <h2 id="dating-ai-title" className="ttm-dating-ai__label">
                {t("datingAiWeAnalyze")}
              </h2>
              <ul className="ttm-dating-ai__list">
                {SIGNAL_KEYS.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </div>
            <div className="ttm-dating-ai__output" aria-label={t("datingAiOutputLabel")}>
              <span className="ttm-dating-ai__output-label">{t("datingAiOutputLabel")}</span>
              <p className="ttm-dating-ai__output-value">{t("datingAiOutputValue")}</p>
            </div>
          </div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
