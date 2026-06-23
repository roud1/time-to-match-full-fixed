"use client"

import { useEffect, useState } from "react"

/** True only after mount — avoids SSR/client mismatch for browser-only APIs. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}
