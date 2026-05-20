"use client"

import { useCallback, useEffect, useState } from "react"
import { getProfileLifeView, recordProfileActivity } from "@/lib/profile-life-store"
import type { ProfileLifeView } from "@/lib/profile-life"

export function useProfileLife(): ProfileLifeView | null {
  const [view, setView] = useState<ProfileLifeView | null>(null)

  const refresh = useCallback(() => setView(getProfileLifeView()), [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    const onUpdate = () => refresh()
    window.addEventListener("ttm-profile-life-updated", onUpdate)
    window.addEventListener("ttm-user-profile-changed", onUpdate)
    return () => {
      clearInterval(id)
      window.removeEventListener("ttm-profile-life-updated", onUpdate)
      window.removeEventListener("ttm-user-profile-changed", onUpdate)
    }
  }, [refresh])

  return view
}

export function useRecordProfileActivity() {
  return useCallback(() => {
    recordProfileActivity()
  }, [])
}
