"use client"

import { useEffect, useState } from "react"

/** Bumps when trust / safety local state changes (cross-component refresh). */
export function useTrustSafetyVersion() {
  const [v, setV] = useState(0)
  useEffect(() => {
    const bump = () => setV((x) => x + 1)
    window.addEventListener("ttm-trust-updated", bump)
    return () => window.removeEventListener("ttm-trust-updated", bump)
  }, [])
  return v
}
