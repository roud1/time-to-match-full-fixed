"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchMe } from "@/client/lib/user/api"
import { hasFreeFreezeAvailable } from "@/client/lib/user/freeze-helpers"
import type { User } from "@/client/lib/user/types"

export const USER_QUERY_KEY = ["user"] as const

export function useUser() {
  const query = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
  })

  const user = query.data ?? null
  const hasFreeFreeze = user != null && hasFreeFreezeAvailable(user.last_freeze_at)
  const freezeBalance = user?.freeze_balance ?? 0

  return {
    user,
    isLoading: query.isLoading,
    isError: query.isError,
    hasFreeFreeze,
    freezeBalance,
    refetch: query.refetch,
  }
}

export function useSetUserCache() {
  const qc = useQueryClient()
  return (patch: Partial<User>) => {
    qc.setQueryData<User>(USER_QUERY_KEY, (prev) => {
      if (!prev) return prev
      return { ...prev, ...patch }
    })
  }
}
