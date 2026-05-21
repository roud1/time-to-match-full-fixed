"use client"

import { useReducedMotion } from "motion/react"
import type { RelationshipWeather } from "@/lib/reality-expansion"
import { cn } from "@/lib/utils"

type WeatherLayerProps = {
  weather: RelationshipWeather
  className?: string
}

export function WeatherLayer({ weather, className }: WeatherLayerProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("er-weather-layer", !reduce && "er-weather-layer--live", className)}
      aria-hidden
      data-er-weather={weather.kind}
      style={{
        ["--er-weather-intensity" as string]: String(weather.intensity),
        ["--er-weather-motion" as string]: String(weather.motionScale),
      }}
    >
      <div className="er-weather-layer__mist" />
      <div className="er-weather-layer__glow" />
    </div>
  )
}
