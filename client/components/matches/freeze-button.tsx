"use client"

import { useState } from "react"
import { Snowflake } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/client/lib/i18n"
import { freezeMatch, isLocalMatchId } from "@/client/lib/match-freeze-client"
import { freezeLocalMatch } from "@/client/lib/match-freeze-local"
import { useUser, USER_QUERY_KEY } from "@/client/hooks/use-user"
import { useQueryClient } from "@tanstack/react-query"
import { PurchaseFreezesModal } from "@/client/components/matches/purchase-freezes-modal"
import { hasFreeFreezeAvailable } from "@/client/lib/user/freeze-helpers"
import { hapticSuccess, hapticTap } from "@/client/lib/haptics"
import { cn } from "@/client/lib/utils"
import { applyGamificationSnapshot } from "@/client/lib/gamification/apply-snapshot"

const touchBtnClass =
  "ttm-touch-target ttm-freeze-btn inline-flex items-center justify-center gap-1 touch-manipulation transition-[background,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"

export type FreezeButtonProps = {
  matchId: string
  profileId: number
  isFrozen: boolean
  expiresAt: string
  onFreezeSuccess: (patch: { expiresAt: string; isFrozen: boolean; matchId?: string }) => void
  hasFreeFreeze?: boolean
  freezeBalance?: number
  className?: string
  compact?: boolean
}

export function FreezeButton({
  matchId,
  profileId,
  isFrozen,
  expiresAt,
  onFreezeSuccess,
  hasFreeFreeze: hasFreeFreezeProp,
  freezeBalance: freezeBalanceProp,
  className,
  compact,
}: FreezeButtonProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const { user, hasFreeFreeze: hookFree, freezeBalance: hookBalance } = useUser()
  const qc = useQueryClient()

  const canUseFree =
    hasFreeFreezeProp ?? (hookFree && !isFrozen && hasFreeFreezeAvailable(user?.last_freeze_at))
  const balance = freezeBalanceProp ?? hookBalance

  const handleFreeze = async () => {
    if (loading) return
    hapticTap()
    setLoading(true)
    try {
      let patch: { expiresAt: string; isFrozen: boolean; matchId?: string } | null = null

      if (isLocalMatchId(matchId)) {
        const local = freezeLocalMatch(profileId, {
          hasFreeFreeze: canUseFree,
          freezeBalance: balance,
        })
        if (!local.ok) {
          if (local.code === "no_freezes") {
            setPurchaseOpen(true)
          } else {
            toast.error(t("matchFreezeError"))
          }
          return
        }
        patch = { expiresAt: local.expiresAt, isFrozen: local.isFrozen }
        if (local.usedPaid) {
          await qc.invalidateQueries({ queryKey: USER_QUERY_KEY })
        } else {
          await qc.invalidateQueries({ queryKey: USER_QUERY_KEY })
        }
      } else {
        const res = await freezeMatch(matchId)
        if (!res.ok) {
          if (res.error.error === "NO_FREEZES" || res.error.error === "no_freezes") {
            setPurchaseOpen(true)
          } else {
            toast.error(res.error.message ?? t("matchFreezeError"))
          }
          return
        }
        patch = {
          expiresAt: res.match.expiresAt,
          isFrozen: res.match.isFrozen,
          matchId: res.match.id,
        }
        applyGamificationSnapshot(qc, res.gamification)
        await qc.invalidateQueries({ queryKey: USER_QUERY_KEY })
      }

      if (patch) {
        hapticSuccess()
        onFreezeSuccess(patch)
        toast.success(t("matchFreezeSuccess"))
      }
    } finally {
      setLoading(false)
    }
  }

  const label = canUseFree
    ? t("matchFreezeFree")
    : balance > 0
      ? t("matchFreezePaid")
      : t("matchFreezeBuy")

  if (isFrozen && balance <= 0 && !canUseFree) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          touchBtnClass,
          "ttm-freeze-btn--frozen px-3 cursor-default",
          compact ? "text-[9px]" : "text-[10px]",
          className
        )}
        aria-label={t("matchFreezeFrozenAria")}
      >
        <Snowflake className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={1.5} aria-hidden />
        <span className="font-extralight uppercase tracking-wider px-0.5">{t("matchFreezeFrozen")}</span>
      </button>
    )
  }

  if (!canUseFree && balance <= 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            hapticTap()
            setPurchaseOpen(true)
          }}
          className={cn(
            touchBtnClass,
            "ttm-freeze-btn--buy px-3",
            compact ? "text-[9px]" : "text-[10px]",
            className
          )}
          aria-label={t("matchFreezeBuyAria")}
        >
          <Snowflake className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={1.5} aria-hidden />
          <span className="font-extralight px-0.5">{label}</span>
        </button>
        <PurchaseFreezesModal
          open={purchaseOpen}
          onOpenChange={setPurchaseOpen}
          onPurchased={() => void handleFreeze()}
        />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleFreeze()}
        disabled={loading}
        className={cn(
          touchBtnClass,
          "px-3 disabled:opacity-50",
          compact ? "text-[9px]" : "text-[10px]",
          className
        )}
        aria-label={t("matchFreezeAria")}
      >
        <Snowflake className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={1.5} aria-hidden />
        <span className="font-extralight px-0.5">{loading ? "…" : label}</span>
      </button>
      <PurchaseFreezesModal open={purchaseOpen} onOpenChange={setPurchaseOpen} />
    </>
  )
}
