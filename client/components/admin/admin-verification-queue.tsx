"use client"

import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { CinematicButton } from "@/client/components/ui/cinematic-button"

type PendingVerification = {
  id: string
  userId: string
  userName: string | null
  gesture: string
  createdAt: string
  selfieUrl: string
  profilePhotoUrl: string | null
}

/** Pending photo verifications: selfie next to the profile photo, approve or reject. */
export function AdminVerificationQueue() {
  const { t } = useI18n()
  const [items, setItems] = useState<PendingVerification[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setError(false)
    try {
      const res = await fetch("/api/admin/verification", { credentials: "include", cache: "no-store" })
      if (!res.ok) throw new Error(String(res.status))
      setItems(((await res.json()) as { requests: PendingVerification[] }).requests)
    } catch {
      setError(true)
      setItems([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const review = async (id: string, status: "approved" | "rejected") => {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setItems((prev) => (prev ?? []).filter((x) => x.id !== id))
    } catch {
      setError(true)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="ttm-admin-card" aria-labelledby="admin-verify-title">
      <h2 id="admin-verify-title" className="ttm-admin-title" style={{ fontSize: "1.25rem" }}>
        {t("adminVerifyTitle")}
      </h2>
      {error && (
        <p className="ttm-admin-error" role="alert">
          {t("adminErrorFetch")}
        </p>
      )}
      {items === null ? (
        <p className="ttm-admin-empty">{t("adminLoading")}</p>
      ) : items.length === 0 ? (
        <p className="ttm-admin-empty">{t("adminVerifyEmpty")}</p>
      ) : (
        <ul className="ttm-admin-verify">
          {items.map((v) => (
            <li key={v.id} className="ttm-admin-verify__item">
              <div className="ttm-admin-verify__photos">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-only, auth-protected image */}
                  <img src={v.selfieUrl} alt={t("adminVerifySelfie")} loading="lazy" />
                  <figcaption>{t("adminVerifySelfie")}</figcaption>
                </figure>
                <figure>
                  {v.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- auth-protected image
                    <img src={v.profilePhotoUrl} alt={t("adminVerifyProfile")} loading="lazy" />
                  ) : (
                    <span className="ttm-admin-verify__none">—</span>
                  )}
                  <figcaption>{t("adminVerifyProfile")}</figcaption>
                </figure>
              </div>
              <p className="ttm-admin-verify__meta">
                <strong>{v.userName ?? v.userId.slice(0, 8)}</strong> · {t("adminVerifyGesture")}: {v.gesture} ·{" "}
                {new Date(v.createdAt).toLocaleString()}
              </p>
              <div className="ttm-admin-verify__actions">
                <CinematicButton size="compact" disabled={busy === v.id} onClick={() => void review(v.id, "approved")}>
                  {t("adminVerifyApprove")}
                </CinematicButton>
                <CinematicButton
                  variant="secondary"
                  size="compact"
                  disabled={busy === v.id}
                  onClick={() => void review(v.id, "rejected")}
                >
                  {t("adminVerifyReject")}
                </CinematicButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
