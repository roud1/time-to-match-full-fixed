"use client"

import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Label } from "@/components/ui/label"
import { DATING_PURPOSES, DEFAULT_MAX_DISTANCE_KM, type DatingPurpose } from "@/lib/interests/types"
import type { Interest } from "@/lib/interests/types"
import { fetchInterests, saveUserInterests, updateUserDiscoveryProfile } from "@/lib/discover/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ProfileDatingFieldsProps = {
  purpose?: DatingPurpose
  maxDistance?: number
  latitude?: number | null
  longitude?: number | null
  dbInterestIds: number[]
  onChange: (patch: {
    purpose?: DatingPurpose
    maxDistance?: number
    latitude?: number | null
    longitude?: number | null
    dbInterestIds?: number[]
  }) => void
}

export function ProfileDatingFields({
  purpose,
  maxDistance = DEFAULT_MAX_DISTANCE_KM,
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

  const persistServer = async () => {
    await Promise.all([
      updateUserDiscoveryProfile({
        purpose,
        maxDistance,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
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
        <div className="flex justify-between gap-2">
          <Label className="text-foreground/80 font-light">{t("profileMaxDistance")}</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {maxDistance} {t("discoverFiltersKm")}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={200}
          step={5}
          value={maxDistance}
          onChange={(e) => onChange({ maxDistance: Number(e.target.value) })}
          className="w-full accent-[var(--accent)]"
        />
      </div>

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
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
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
