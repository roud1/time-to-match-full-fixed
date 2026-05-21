"use client"

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import Image from "next/image"
import { useMemo } from "react"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { GeoPosition } from "@/lib/geo"

import "leaflet/dist/leaflet.css"

function pinIcon(imageUrl: string, label: string) {
  const safeLabel = label.replace(/</g, "")
  return L.divIcon({
    className: "ttm-map-pin",
    html: `<div class="ttm-map-pin-inner"><img src="${imageUrl}" alt="" /><span>${safeLabel}</span></div>`,
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

type NearbyMapProps = {
  userPosition: GeoPosition
  profiles: SwipeProfile[]
  userLabel: string
}

export function NearbyMap({ userPosition, profiles, userLabel }: NearbyMapProps) {
  const center: [number, number] = [userPosition.lat, userPosition.lng]

  const markers = useMemo(
    () =>
      profiles.map((p) => ({
        profile: p,
        icon: pinIcon(p.image, p.name.split(" ")[0]),
        pos: [p.lat, p.lng] as [number, number],
      })),
    [profiles]
  )

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full rounded-2xl z-0"
      style={{ background: "#0a0a0f" }}
    >
      <TileLayer
        attribution="&copy; OSM &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
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
        <Marker key={profile.id} position={pos} icon={icon}>
          <Popup>
            <div className="flex gap-3 items-center min-w-[180px]">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <Image src={profile.image} alt="" width={48} height={48} className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {profile.name}, {profile.age}
                </p>
                <p className="text-xs text-gray-500">{profile.distance}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
