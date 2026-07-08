"use client"

import { useEffect } from "react"

/**
 * useScrollReveal — автоматически добавляет класс .is-visible
 * ко всем элементам с классом .ttm-reveal когда они входят в viewport.
 */
export function useScrollReveal(root?: Element | null) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return

    const els = (root ?? document).querySelectorAll(".ttm-reveal")

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [root])
}
