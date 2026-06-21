"use client"

import { useEffect, useRef, useState } from "react"

type Tilt = { rotateX: number; rotateY: number }

export function useMouseTilt(enabled: boolean, maxTilt = 7) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState<Tilt>({ rotateX: 0, rotateY: 0 })

  useEffect(() => {
    if (!enabled) {
      setTilt({ rotateX: 0, rotateY: 0 })
      return
    }

    const el = ref.current
    if (!el) return

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (event.clientX - cx) / (rect.width / 2)
      const dy = (event.clientY - cy) / (rect.height / 2)
      setTilt({
        rotateX: Math.max(-maxTilt, Math.min(maxTilt, -dy * maxTilt)),
        rotateY: Math.max(-maxTilt, Math.min(maxTilt, dx * maxTilt)),
      })
    }

    const onLeave = () => setTilt({ rotateX: 0, rotateY: 0 })

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [enabled, maxTilt])

  return { ref, ...tilt }
}
