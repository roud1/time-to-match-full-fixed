"use client"

import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { Label } from "@/client/components/ui/label"
import { DATING_PURPOSES, DEFAULT_MAX_DISTANCE_KM, type DatingPurpose } from "@/client/lib/interests/types"
import type { Interest } from "@/client/lib/interests/types"
import { fetchInterests, saveUserInterests, updateUserDiscoveryProfile } from "@/client/lib/discover/api"
import { cn } from "@/client/lib/utils"
import { toast } from "sonner"

type ProfileDatingFieldsProps = {
  purpose?: DatingPurpose
  maxDistance?: number
  ageMin?: number | null
  ageMax?: number | null
  /** Own gender — synced to server `users.gender` (male/female). */
  gender?: "male" | "female" | "other"
  latitude?: number | null
  longitude?: number | null
  dbInterestIds: number[]
  onChange: (patch: {
    purpose?: DatingPurpose
    maxDistance?: number
    ageMin?: number | null
    ageMax?: number | null
    gender?: "male" | "female" | "other"
    latitude?: number | null
    longitude?: number | null
    dbInterestIds?: number[]
  }) => void
}

export function ProfileDatingFields({
  purpose,
  maxDistance = DEFAULT_MAX_DISTANCE_KM,
  ageMin,
  ageMax,
  gender,
  latitude,
  longitude,
  dbInterestIds,
  onChange,
}: ProfileDatingFieldsProps) {
  const { t } = useI18n()
  const [catalog, setCatalog] = useState<Interest[]>([])
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    void fetchInterests().then(setCatalog)
  }, [])

  const purposeLabel = (p: DatingPurpose) => t(`datingPurpose_${p}` as "datingPurpose_serious")

  const toggleInterest = (id: number) => {
    const next = dbInterestIds.includes(id)
      ? dbInterestIds.filter((x) => x !== id)
      : [...dbInterestIds, id]
    onChange({ dbInterestIds: next })
  }

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(t("profileGeoUnsupported"))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
        toast.success(t("profileGeoSuccess"))
      },
      () => {
        setLocating(false)
        toast.error(t("profileGeoDenied"))
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }, [onChange, t])

  const serverGender =
    gender === "male" || gender === "female" ? gender : null

  const persistServer = async () => {
    await Promise.all([
      updateUserDiscoveryProfile({
        purpose,
        gender: serverGender,
        ageMin: ageMin ?? null,
        ageMax: ageMax ?? null,
        maxDistance,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        profile:
          gender != null
            ? { gender: gender === "other" ? "other" : gender }
            : undefined,
      }),
      dbInterestIds.length ? saveUserInterests(dbInterestIds) : saveUserInterests([]),
    ])
  }

  useEffect(() => {
    const handler = () => {
      void persistServer()
    }
    window.addEventListener("ttm-profile-dating-sync", handler)
    return () => window.removeEventListener("ttm-profile-dating-sync", handler)
  })

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-white/50 font-light">{t("profileDatingSectionLead")}</p>

      <div className="space-y-2">
        <Label className="text-foreground/80 font-light">{t("profileInterests")}</Label>
        {catalog.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {catalog.map((item) => {
              const selected = dbInterestIds.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all touch-manipulation",
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-soft-bg)] text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  )}
                >
                  {item.emoji ? `${item.emoji} ` : ""}
                  {item.name}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-light">{t("profileInterestsCatalogEmpty")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground/80 font-light">{t("datingPurposeLabel")}</Label>
        <select
          value={purpose ?? ""}
          onChange={(e) =>
            onChange({
              purpose: (e.target.value || undefined) as DatingPurpose | undefined,
            })
          }
          className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm font-light"
        >
          <option value="">{t("datingPurpose_unknown")}</option>
          {DATING_PURPOSES.map((p) => (
            <option key={p} value={p}>
              {purposeLabel(p)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <span className="text-foreground/80 font-light text-sm">{t("profileGender")}</span>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {(
            [
              { value: "male" as const, label: t("regGenderMale") },
              { value: "female" as const, label: t("regGenderFemale") },
              { value: "other" as const, label: t("regGenderOther") },
            ] as const
          ).map((opt) => {
            const selected = gender === opt.value
            return (
              <label
                key={opt.value}
                className={cn(
                  "inline-flex cursor-pointer rounded-full border px-3 py-2 text-xs font-light touch-manipulation transition-colors",
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent-soft-bg)] text-[var(--text-primary)]"
                    : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                )}
              >
                <input
                  type="radio"
                  name="profile-gender"
                  checked={selected}
                  onChange={() => onChange({ gender: opt.value })}
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
          <Label className="text-foreground/80 font-light">{t("discoverFiltersAgeFrom")}</Label>
          <input
            type="number"
            min={18}
            max={99}
            placeholder="18"
            value={ageMin ?? ""}
            onChange={(e) =>
              onChange({
                ageMin: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm font-light tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 font-light">{t("discoverFiltersAgeTo")}</Label>
          <input
            type="number"
            min={18}
            max={99}
            placeholder="35"
            value={ageMax ?? ""}
            onChange={(e) =>
              onChange({
                ageMax: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm font-light tabular-nums"
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground font-light -mt-2">{t("profileDiscoverAgeHint")}</p>

      <div className="space-y-2">
        <div className="flex justify-between gap-2">
          <Label className="text-foreground/80 font-light">{t("profileMaxDistance")}</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {maxDistance} {t("discoverFiltersKm")}
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={500}
          step={10}
          value={maxDistance}
          onChange={(e) => onChange({ maxDistance: Number(e.target.value) })}
          className="w-full accent-[var(--accent)]"
        />
      </div>

      <button
        type="button"
        disabled={locating}
        onClick={detectLocation}
        className="w-full rounded-xl border border-foreground/15 bg-foreground/5 py-2.5 text-sm font-light hover:bg-foreground/8 transition-colors disabled:opacity-50"
      >
        {locating ? t("profileGeoLoading") : t("profileGeoDetect")}
      </button>
      {(latitude != null || longitude != null) && (
        <p className="text-[10px] text-muted-foreground font-light tabular-nums">
          {latitude?.toFixed(4) ?? "—"}, {longitude?.toFixed(4) ?? "—"}
        </p>
      )}
    </div>
  )
}

export function dispatchProfileDatingSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ttm-profile-dating-sync"))
  }
}
