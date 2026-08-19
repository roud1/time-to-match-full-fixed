/**
 * AdSenseScript — загружает Google AdSense скрипт.
 * Добавить в app/layout.tsx в <head>.
 * Работает только когда NEXT_PUBLIC_ADSENSE_PUBLISHER_ID задан.
 */
export function AdSenseScript() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  if (!publisherId) return null
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
    />
  )
}
