"use client"

import dynamic from "next/dynamic"

// Utilitas koordinat murni (tanpa dependensi peta) — aman diimpor statis oleh
// consumer tanpa ikut menarik maplibre-gl.
export function parseCoordinate(
  value?: string | null
): { lat: number; lng: number } | null {
  if (!value) return null
  const matches = value.match(/-?\d+(\.\d+)?/g)
  if (!matches || matches.length < 2) return null
  const lat = Number.parseFloat(matches[0])
  const lng = Number.parseFloat(matches[1])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

export function formatCoordinate(lat: number, lng: number): string {
  return `(${lat.toFixed(6)},${lng.toFixed(6)})`
}

// Peta (maplibre-gl, ~800KB parse) di-code-split: chunk-nya hanya diunduh saat
// picker benar-benar dirender, sehingga tidak membebani initial bundle route
// kontak-pemasok/kontak-pelanggan/lokasi. `ssr:false` valid karena file ini
// Client Component.
const LocationMapCanvas = dynamic(
  () => import("./location-map-canvas").then((m) => m.LocationMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="h-72 w-full animate-pulse overflow-hidden rounded-2xl border border-border bg-muted/40" />
      </div>
    ),
  }
)

interface LocationMapPickerProps {
  value?: string | null
  onChange: (coordinate: string) => void
  disabled?: boolean
}

export function LocationMapPicker(props: LocationMapPickerProps) {
  return <LocationMapCanvas {...props} />
}
