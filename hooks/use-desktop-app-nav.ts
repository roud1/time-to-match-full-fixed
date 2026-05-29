"use client"

import { useSyncExternalStore } from "react"

const DESKTOP_NAV_MQ = "(min-width: 1024px)"

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_NAV_MQ)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_NAV_MQ).matches
}

function getServerSnapshot() {
  return false
}

export function useDesktopAppNav(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
