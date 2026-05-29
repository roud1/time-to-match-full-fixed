"use client"

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import Image from "next/image"
import { useEffect, useMemo } from "react"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { GeoPosition } from "@/lib/geo"

import "leaflet/dist/leaflet.css"

function pinIcon(imageUrl: string, label: string, selected = false) {
  const safeLabel = label.replace(/</g, "")
  const selectedClass = selected ? " ttm-map-pin-inner--selected" : ""
  return L.divIcon({
    className: "ttm-map-pin",
    html: `<div class="ttm-map-pin-inner${selectedClass}"><img src="${imageUrl}" alt="" /><span>${safeLabel}</span></div>`,
    iconSize: [52, 62],
    iconAnchor: [26, 62],
    popupAnchor: [0, -58],
  })
}

const userIcon = L.divIcon({
  className: "ttm-map-pin-user",
  html: `<div class="ttm-map-user-dot"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function MapFocus({ position, zoom = 14 }: { position: [number, number]; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, zoom, { duration: 0.75 })
  }, [map, position, zoom])
  return null
}

type NearbyMapProps = {
  userPosition: GeoPosition
  profiles: SwipeProfile[]
  userLabel: string
  selectedProfileId?: number | null
  onSelectProfile?: (profileId: number) => void
  onOpenProfile?: (profileId: number) => void
  openProfileLabel?: string
}

export function NearbyMap({
  userPosition,
  profiles,
  userLabel,
  selectedProfileId = null,
  onSelectProfile,
  onOpenProfile,
  openProfileLabel,
}: NearbyMapProps) {
  const center: [number, number] = [userPosition.lat, userPosition.lng]

  const selected = profiles.find((p) => p.id === selectedProfileId)

  const markers = useMemo(
    () =>
      profiles.map((p) => ({
        profile: p,
        icon: pinIcon(p.image, p.name.split(" ")[0], p.id === selectedProfileId),
        pos: [p.lat, p.lng] as [number, number],
      })),
    [profiles, selectedProfileId]
  )

  const focusPos: [number, number] | null = selected
    ? [selected.lat, selected.lng]
    : null

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full z-0"
      style={{ background: "#0a0a0f" }}
    >
      <TileLayer
        attribution="&copy; OSM &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {focusPos && <MapFocus position={focusPos} />}
      <Circle
        center={center}
        radius={8000}
        pathOptions={{ color: "#8b5cf6", fillColor: "#6366f1", fillOpacity: 0.1, weight: 1 }}
      />
      <Marker position={center} icon={userIcon}>
        <Popup>
          <span className="text-sm font-medium">{userLabel}</span>
        </Popup>
      </Marker>
      {markers.map(({ profile, icon, pos }) => (
        <Marker
          key={profile.id}
          position={pos}
          icon={icon}
          eventHandlers={{
            click: () => onSelectProfile?.(profile.id),
          }}
        >
          <Popup>
            <div className="flex flex-col gap-2 min-w-[180px]">
              <div className="flex gap-3 items-center">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={profile.image}
                    alt=""
                    width={48}
                    height={48}
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {profile.name}, {profile.age}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile.location} · {profile.distance}
                  </p>
                </div>
              </div>
              {openProfileLabel && onOpenProfile && (
                <button
                  type="button"
                  className="ttm-map-popup__open text-xs font-medium text-violet-600 hover:text-violet-800 text-left w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenProfile(profile.id)
                  }}
                >
                  {openProfileLabel}
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
