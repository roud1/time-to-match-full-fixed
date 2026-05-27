"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { VerificationGesturePrompt } from "@/lib/verification/types"
import { fetchVerificationGesture, submitVerificationSelfie } from "@/lib/verification/api"
import { cn } from "@/lib/utils"

type PhotoVerificationModalProps = {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}

export function PhotoVerificationModal({ open, onClose, onSubmitted }: PhotoVerificationModalProps) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [gesture, setGesture] = useState<VerificationGesturePrompt | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const loadGesture = useCallback(async () => {
    setLoading(true)
    setError(null)
    const g = await fetchVerificationGesture()
    setGesture(g)
    setLoading(false)
  }, [])

  const openModal = useCallback(() => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setFile(null)
    setError(null)
    void loadGesture()
  }, [loadGesture])

  useEffect(() => {
    if (open) void openModal()
  }, [open, openModal])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f || !f.type.startsWith("image/")) return
    setFile(f)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
  }

  const handleSubmit = async () => {
    if (!gesture || !file) return
    setSubmitting(true)
    setError(null)
    const result = await submitVerificationSelfie(gesture.gesture, file)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onSubmitted()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label={t("photoVerifyClose")}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className={cn(
              "relative w-full max-w-md rounded-[1.5rem] border p-6 shadow-xl",
              "border-[var(--border)] bg-[var(--bg-primary)]"
            )}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            <h2 className="text-lg font-extralight tracking-tight text-[var(--text-primary)] text-center mb-1">
              {t("photoVerifyModalTitle")}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-light text-center mb-5">
              {t("photoVerifyModalLead")}
            </p>

            {loading || !gesture ? (
              <p className="text-center text-sm text-[var(--text-secondary)] py-8">…</p>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <span className="text-5xl block mb-3" aria-hidden>
                    {gesture.emoji}
                  </span>
                  <p className="text-sm font-light text-[var(--text-primary)] px-4 leading-relaxed">
                    {gesture.instruction}
                  </p>
                </div>

                <ol className="text-xs text-[var(--text-secondary)] font-light space-y-1.5 list-decimal list-inside">
                  <li>{t("photoVerifyStep1")}</li>
                  <li>{t("photoVerifyStep2")}</li>
                  <li>{t("photoVerifyStep3")}</li>
                </ol>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={onFile}
                />

                {preview && (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--border)] aspect-[3/4] max-h-48 mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl border border-[var(--border)] py-3 text-sm font-light text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--accent-soft-bg)]/40 transition-colors"
                >
                  {file ? t("photoVerifyRetake") : t("photoVerifyTakeSelfie")}
                </button>

                {error && (
                  <p className="text-xs text-red-400/90 text-center font-light">{error}</p>
                )}

                <button
                  type="button"
                  disabled={!file || submitting}
                  onClick={() => void handleSubmit()}
                  className="w-full rounded-full py-3 text-sm font-light text-white disabled:opacity-40"
                  style={{ background: "var(--ttm-brand-gradient-sync)" }}
                >
                  {submitting ? t("photoVerifySubmitting") : t("photoVerifySubmit")}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onClose()}
              className="mt-4 w-full text-xs text-[var(--text-secondary)] font-light py-2"
            >
              {t("photoVerifyCancel")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
