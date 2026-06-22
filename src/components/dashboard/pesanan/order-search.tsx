"use client"

import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

const MODES = [
  { value: "order" as const, label: "Pesanan" },
  { value: "sku" as const, label: "SKU / Produk" },
]

export function OrderSearch({
  query,
  searchBy,
  onQueryChange,
  onSearchByChange,
}: {
  query: string
  searchBy: "order" | "sku"
  onQueryChange: (v: string) => void
  onSearchByChange: (v: "order" | "sku") => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border bg-muted/40 p-0.5">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onSearchByChange(m.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              searchBy === m.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchBy === "order" ? "Cari no. pesanan atau nama pelanggan..." : "Cari SKU atau nama produk..."}
          className="pl-9"
        />
      </div>
    </div>
  )
}
