"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import type { DiscoverFilters } from "@/client/lib/discover/types"
import { DATING_PURPOSES, type DatingPurpose } from "@/client/lib/interests/types"
import { cn } from "@/client/lib/utils"

type DiscoverFiltersModalProps = {
  open: boolean
  filters: DiscoverFilters
  hasLocation: boolean
  onClose: () => void
  onApply: (filters: DiscoverFilters) => void
}

export function DiscoverFiltersModal({
  open,
  filters,
  hasLocation,
  onClose,
  onApply,
}: DiscoverFiltersModalProps) {
  const { t } = useI18n()
  const [draft, setDraft] = useState<DiscoverFilters>(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const purposeLabel = (p: DatingPurpose) => t(`datingPurpose_${p}` as "datingPurpose_serious")

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label={t("discoverFiltersClose")}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="relative w-full max-w-md rounded-t-[1.5rem] sm:rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-primary)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <h2 className="text-lg font-extralight tracking-tight text-[var(--text-primary)] mb-4">
              {t("discoverFiltersTitle")}
            </h2>

            <div className="space-y-4 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
              <div className="space-y-2">
                <span className="text-xs text-[var(--text-secondary)] font-light">{t("profileGender")}</span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("profileGender")}>
                  {(
                    [
                      { value: "", label: t("discoverFiltersAny") },
                      { value: "male", label: t("regGenderMale") },
                      { value: "female", label: t("regGenderFemale") },
                    ] as const
                  ).map((opt) => {
                    const selected = (draft.gender ?? "") === opt.value
                    return (
                      <label
                        key={opt.value || "all"}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-light cursor-pointer touch-manipulation transition-colors",
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent-soft-bg)] text-[var(--text-primary)]"
                            : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                        )}
                      >
                        <input
                          type="radio"
                          name="discover-filter-gender"
                          value={opt.value}
                          checked={selected}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              gender:
                                opt.value === "male" || opt.value === "female"
                                  ? opt.value
                                  : undefined,
                            }))
                          }
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-[var(--text-secondary)] font-light">{t("discoverFiltersAgeFrom")}</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={draft.ageMin ?? draft.minAge ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        ageMin: e.target.value ? Number(e.target.value) : undefined,
                        minAge: undefined,
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm font-light"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[var(--text-secondary)] font-light">{t("discoverFiltersAgeTo")}</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={draft.ageMax ?? draft.maxAge ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        ageMax: e.target.value ? Number(e.target.value) : undefined,
                        maxAge: undefined,
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm font-light"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[var(--text-secondary)] font-light">{t("datingPurposeLabel")}</label>
                <select
                  value={draft.purpose ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      purpose: e.target.value || undefined,
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm font-light"
                >
                  <option value="">{t("discoverFiltersAny")}</option>
                  {DATING_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {purposeLabel(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cn("space-y-2", !hasLocation && "opacity-50")}>
                <div className="flex justify-between gap-2">
                  <label className="text-xs text-[var(--text-secondary)] font-light">{t("profileMaxDistance")}</label>
                  <span className="text-xs tabular-nums text-[var(--text-primary)]">
                    {draft.maxDistance ?? 50} {t("discoverFiltersKm")}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  disabled={!hasLocation}
                  value={draft.maxDistance ?? 50}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, maxDistance: Number(e.target.value) }))
                  }
                  className="w-full accent-[var(--accent)]"
                />
                {!hasLocation && (
                  <p className="text-[10px] text-[var(--text-secondary)] font-light">{t("discoverFiltersNeedLocation")}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setDraft({})
                  onApply({})
                }}
                className="flex-1 rounded-full border border-[var(--border)] py-2.5 text-sm font-light text-[var(--text-secondary)]"
              >
                {t("discoverFiltersReset")}
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draft)
                  onClose()
                }}
                className="flex-1 rounded-full py-2.5 text-sm font-light text-white"
                style={{ background: "var(--ttm-brand-gradient-sync)" }}
              >
                {t("discoverFiltersApply")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
