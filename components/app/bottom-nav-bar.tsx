"use client"

import { Suspense } from "react"
import { BottomNav, type BottomNavId } from "@/components/app/bottom-nav"

type BottomNavBarProps = {
  active?: BottomNavId
}

export function BottomNavBar({ active }: BottomNavBarProps) {
  return (
    <Suspense fallback={<nav className="fixed bottom-0 left-0 right-0 h-20 z-50" aria-hidden />}>
      <BottomNav active={active} />
    </Suspense>
  )
}
