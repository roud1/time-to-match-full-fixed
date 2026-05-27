"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchVerificationStatus } from "@/lib/verification/api"
import type { VerificationStatusResponse } from "@/lib/verification/types"

export const VERIFICATION_STATUS_KEY = ["verification", "status"] as const

export function useVerificationStatus() {
  const query = useQuery({
    queryKey: VERIFICATION_STATUS_KEY,
    queryFn: fetchVerificationStatus,
    staleTime: 30_000,
  })

  const status: VerificationStatusResponse = query.data ?? {
    verified: false,
    requestStatus: "none",
  }

  return {
    ...status,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useInvalidateVerificationStatus() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: VERIFICATION_STATUS_KEY })
}
