"use client"

import { useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { useVerificationStatus, useInvalidateVerificationStatus } from "@/client/hooks/use-verification-status"
import { USER_QUERY_KEY } from "@/client/hooks/use-user"
import { useQueryClient } from "@tanstack/react-query"
import { PhotoVerificationModal } from "@/client/components/profile/photo-verification-modal"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"
import { cn } from "@/client/lib/utils"

export function PhotoVerificationBlock() {
  const { t } = useI18n()
  const { verified, requestStatus, isLoading } = useVerificationStatus()
  const invalidate = useInvalidateVerificationStatus()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const onSubmitted = () => {
    void invalidate()
    void qc.invalidateQueries({ queryKey: USER_QUERY_KEY })
  }

  return (
    <>
      <div
        className={cn(
          "rounded-[1.35rem] border p-4 mb-5",
          "border-[var(--border)] bg-[var(--bg-secondary)]/60 backdrop-blur-xl"
        )}
      >
        <div className="flex items-start gap-3">
          {verified ? (
            <VerifiedBadge size={20} title={t("photoVerifiedLabel")} />
          ) : (
            <span className="w-5 h-5 rounded-full border border-[var(--border)] shrink-0 mt-0.5" aria-hidden />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm font-light text-[var(--text-primary)]">{t("photoVerifySectionTitle")}</p>

            {isLoading ? (
              <p className="text-xs text-[var(--text-secondary)] font-light">…</p>
            ) : verified ? (
              <p className="text-xs text-emerald-400/90 font-light">{t("photoVerifiedLabel")}</p>
            ) : requestStatus === "pending" ? (
              <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
                {t("photoVerifyPending")}
              </p>
            ) : requestStatus === "rejected" ? (
              <div className="space-y-2">
                <p className="text-xs text-amber-300/90 font-light">{t("photoVerifyRejected")}</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-light px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--accent-soft-bg)]/40 transition-colors"
                >
                  {t("photoVerifyCta")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-xs font-light px-4 py-2.5 rounded-full text-white touch-manipulation"
                style={{ background: "var(--ttm-brand-gradient-sync)" }}
              >
                {t("photoVerifyCta")}
              </button>
            )}
          </div>
        </div>
      </div>

      <PhotoVerificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={onSubmitted}
      />
    </>
  )
}
