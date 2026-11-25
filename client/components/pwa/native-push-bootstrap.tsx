"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { isNativePushAvailable, syncNativePush } from "@/client/lib/native-push"

/**
 * Android app: once the user is inside the app (signed in), ask for notification permission one
 * time and register the device, so likes, matches and messages arrive as notifications.
 */
export function NativePushBootstrap() {
  const pathname = usePathname() ?? ""
  const inApp = pathname === "/app" || pathname.startsWith("/app/") || pathname.startsWith("/profile")

  useEffect(() => {
    if (!inApp || !isNativePushAvailable()) return
    let asked = false
    try {
      asked = localStorage.getItem("ttm-native-push-asked") === "1"
      localStorage.setItem("ttm-native-push-asked", "1")
    } catch {
      /* storage blocked */
    }
    void syncNativePush({ ask: !asked })
  }, [inApp])

  return null
}
