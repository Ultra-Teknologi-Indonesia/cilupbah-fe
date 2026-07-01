"use client"

import * as React from "react"
import type { MapMouseEvent } from "maplibre-gl"
import { MapPinIcon } from "lucide-react"

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map"
import { parseCoordinate, formatCoordinate } from "./location-map-picker"

// Jakarta sebagai center default [lng, lat].
const DEFAULT_CENTER: [number, number] = [106.8272, -6.1751]

// Style peta cerah (Carto Voyager) — dipakai untuk light & dark agar peta
// tidak pernah tampil gelap, terlepas dari tema dashboard.
const BRIGHT_MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
const MAP_STYLES = { light: BRIGHT_MAP_STYLE, dark: BRIGHT_MAP_STYLE }

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  const { map } = useMap()

  React.useEffect(() => {
    if (!map) return
    const handler = (e: MapMouseEvent) => onPick(e.lngLat.lat, e.lngLat.lng)
    map.on("click", handler)
    return () => {
      map.off("click", handler)
    }
  }, [map, onPick])

  return null
}

// Pinpoint otomatis: saat peta dimuat dan belum ada koordinat tersimpan,
// deteksi lokasi perangkat lalu arahkan peta + tandai marker secara otomatis.
function AutoLocate({
  enabled,
  onPick,
}: {
  enabled: boolean
  onPick: (lat: number, lng: number) => void
}) {
  const { map } = useMap()
  const requestedRef = React.useRef(false)

  React.useEffect(() => {
    if (!enabled || !map || requestedRef.current) return
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return

    requestedRef.current = true
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 })
        onPick(latitude, longitude)
      },
      (error) => {
        console.error("Pinpoint otomatis gagal:", error)
      }
    )
  }, [enabled, map, onPick])

  return null
}

// Arahkan peta ke koordinat saat nilai berubah dari luar (mis. pilih kelurahan).
// Hanya fly bila titik baru di luar viewport agar klik/seret marker tidak
// memicu recenter yang mengganggu.
function RecenterOnValue({
  coord,
}: {
  coord: { lat: number; lng: number } | null
}) {
  const { map } = useMap()
  const lastKeyRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!map || !coord) return
    const key = `${coord.lat},${coord.lng}`
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key

    const center: [number, number] = [coord.lng, coord.lat]
    if (!map.getBounds().contains(center)) {
      map.flyTo({ center, zoom: 15, duration: 1200 })
    }
  }, [map, coord])

  return null
}

export interface LocationMapCanvasProps {
  value?: string | null
  onChange: (coordinate: string) => void
  disabled?: boolean
}

export function LocationMapCanvas({
  value,
  onChange,
  disabled,
}: LocationMapCanvasProps) {
  const coord = parseCoordinate(value)
  const center: [number, number] = coord ? [coord.lng, coord.lat] : DEFAULT_CENTER

  const handlePick = React.useCallback(
    (lat: number, lng: number) => {
      if (disabled) return
      onChange(formatCoordinate(lat, lng))
    },
    [disabled, onChange]
  )

  return (
    <div className="space-y-2">
      <div className="h-72 w-full overflow-hidden rounded-2xl border border-border">
        <Map center={center} zoom={coord ? 15 : 11} styles={MAP_STYLES}>
          <MapControls showZoom showLocate onLocate={(c) => handlePick(c.latitude, c.longitude)} />
          {!disabled && <MapClickHandler onPick={handlePick} />}
          {!disabled && <AutoLocate enabled={!coord} onPick={handlePick} />}
          <RecenterOnValue coord={coord} />
          {coord && (
            <MapMarker
              longitude={coord.lng}
              latitude={coord.lat}
              draggable={!disabled}
              onDragEnd={(lngLat) => handlePick(lngLat.lat, lngLat.lng)}
            >
              <MarkerContent>
                <MapPinIcon className="size-7 -translate-y-1/2 fill-primary text-primary-foreground drop-shadow" />
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>
      <p className="text-xs text-muted-foreground">
        {coord
          ? `Koordinat: ${value}`
          : "Mendeteksi lokasi Anda secara otomatis… atau klik pada peta untuk menandai lokasi."}
      </p>
    </div>
  )
}
