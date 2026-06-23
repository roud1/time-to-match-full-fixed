"use client"

import type { ConnectionForecast } from "@/client/lib/intelligence"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

export function ConnectionForecastStrip({
  forecast,
  className,
}: {
  forecast: ConnectionForecast
  className?: string
}) {
  const { t } = useI18n()

  return (
    <div className={cn("p14-forecast", className)} data-forecast-tone={forecast.tone}>
      <p className="p14-forecast__eyebrow">{t("intelForecastEyebrow")}</p>
      <p className="p14-forecast__main">{t(forecast.insightKey)}</p>
      {forecast.secondaryKey && (
        <p className="p14-forecast__sub">{t(forecast.secondaryKey)}</p>
      )}
    </div>
  )
}
