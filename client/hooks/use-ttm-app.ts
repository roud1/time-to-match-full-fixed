"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getSnapshot = () => document.documentElement.hasAttribute("data-ttm-app")
const getServerSnapshot = () => false

/**
 * True inside the native app / installed PWA (html[data-ttm-app], set before first paint in app/layout.tsx).
 * Always false during SSR and hydration, so app-only markup never causes a hydration mismatch.
 */
export function useTtmApp(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
