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

/**
 * Luvia design (html[data-lv]) is on for every page — website and native app — since Luvia 2.0.
 * Components use this to pick the Luvia view; useTtmApp() stays for native-shell-only behaviour.
 */
export function useLuviaUi(): boolean {
  return true
}
