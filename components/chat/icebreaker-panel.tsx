"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { Icebreaker } from "@/lib/icebreakers/types"
import { fetchRandomIcebreakers } from "@/lib/icebreakers/api"
import { cn } from "@/lib/utils"

type IcebreakerPanelProps = {
  onPick: (text: string) => void
  onDismiss: () => void
  className?: string
  variant?: "default" | "compact"
}

export function IcebreakerPanel({
  onPick,
  onDismiss,
  className,
  variant = "default",
}: IcebreakerPanelProps) {
  const { t } = useI18n()
  const [items, setItems] = useState<Icebreaker[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const next = await fetchRandomIcebreakers(3)
    setItems(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const suggestions = loading && items.length === 0 ? null : items

  if (variant === "compact") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className={cn("ttm-chat-icebreaker--compact w-full", className)}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-light text-[var(--text-secondary)]">{t("icebreakerTitle")}</p>
            <button
              type="button"
              onClick={onDismiss}
              className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {t("icebreakerWriteOwn")}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 ttm-chat-scroll">
            {suggestions?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPick(item.text)}
                className="shrink-0 max-w-[14rem] rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-left text-[11px] font-light italic text-[var(--text-primary)] hover:border-[var(--accent-soft-border)] active:scale-[0.99]"
              >
                «{item.text}»
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className={cn("w-full", className)}
      >
        <div
          className={cn(
            "rounded-2xl border p-3.5 space-y-3",
            "border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl",
            "shadow-[0_12px_40px_-20px_rgba(0,0,0,0.35)]"
          )}
        >
          <p className="text-sm font-light text-[var(--text-primary)]">{t("icebreakerTitle")}</p>

          <div className="space-y-2">
            {!suggestions ? (
              <p className="text-xs text-[var(--text-secondary)] font-light py-2 text-center">…</p>
            ) : (
              suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onPick(item.text)}
                  className={cn(
                    "w-full text-left rounded-xl px-3.5 py-3 transition-all touch-manipulation",
                    "bg-[var(--bg-primary)] border border-[var(--border)]",
                    "shadow-[0_4px_20px_-8px_rgba(0,0,0,0.2)]",
                    "hover:border-[var(--accent-soft-border)] active:scale-[0.99]"
                  )}
                >
                  <span className="text-[11px] mr-1.5 opacity-70" aria-hidden>
                    💬
                  </span>
                  <span className="text-sm font-light italic text-[var(--text-primary)] leading-snug">
                    «{item.text}»
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => void load()}
              className="flex-1 min-w-[8rem] rounded-full border border-[var(--border)] py-2 text-xs font-light text-[var(--text-secondary)] hover:bg-[var(--accent-soft-bg)]/50 transition-colors disabled:opacity-50"
            >
              {t("icebreakerMore")}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 min-w-[8rem] rounded-full py-2 text-xs font-light text-[var(--text-primary)] border border-[var(--accent-soft-border)] bg-[var(--accent-soft-bg)]/40 hover:bg-[var(--accent-soft-bg)] transition-colors"
            >
              {t("icebreakerWriteOwn")}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
