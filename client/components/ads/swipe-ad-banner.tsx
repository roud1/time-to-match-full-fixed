"use client"

/**
 * SwipeAdBanner — Google AdSense баннер между свайп-карточками.
 *
 * Показывается каждые AD_EVERY_N свайпов для Free пользователей.
 * Premium/VIP пользователи — без рекламы.
 *
 * Для включения:
 *   1. Получить одобрение Google AdSense
 *   2. Добавить NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXX в env
 *   3. Добавить NEXT_PUBLIC_ADSENSE_SLOT_ID=XXXXXXXXXX в env
 *
 * До настройки AdSense компонент рендерит placeholder (только в dev).
 */

import { useEffect, useRef } from "react"

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
const SLOT_ID      = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID
const IS_DEV       = process.env.NODE_ENV !== "production"

type SwipeAdBannerProps = {
  className?: string
}

export function SwipeAdBanner({ className }: SwipeAdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!PUBLISHER_ID || !SLOT_ID || pushed.current) return
    try {
      // Push ad — standard AdSense pattern
      ;(window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || []
      ;(window as Window & { adsbygoogle?: unknown[] }).adsbygoogle!.push({})
      pushed.current = true
    } catch {
      // AdSense not loaded yet — will retry on next render
    }
  }, [])

  // Dev placeholder — shows what the ad area looks like without real AdSense
  if (IS_DEV && (!PUBLISHER_ID || !SLOT_ID)) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: 120,
          background: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          margin: "8px 0",
        }}
      >
        <span style={{ fontSize: 10, color: "rgba(245,245,247,0.28)", letterSpacing: ".1em", textTransform: "uppercase" }}>
          Google AdSense
        </span>
        <span style={{ fontSize: 11, color: "rgba(245,245,247,0.18)" }}>
          Добавь NEXT_PUBLIC_ADSENSE_PUBLISHER_ID в env
        </span>
      </div>
    )
  }

  // No publisher ID — don't render anything in production
  if (!PUBLISHER_ID || !SLOT_ID) return null

  return (
    <div
      className={className}
      style={{ width: "100%", margin: "8px 0", textAlign: "center" }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: 120 }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
