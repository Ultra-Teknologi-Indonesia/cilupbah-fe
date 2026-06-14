"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LayoutGridIcon, TableIcon, PlusIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import type { Product } from "../_data/mock-products"
import { ProductTable } from "./product-table"
import { ProductCardView } from "./product-card-view"

type View = "card" | "table"

export function ProductExplorer({ data }: { data: Product[] }) {
  const router = useRouter()
  const [view, setView] = React.useState<View>("card")

  return (
    // Same richer liquid-glass surface as the page title + stats panels.
    <LiquidGlass
      radius={24}
      intensity="default"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-base font-medium">Daftar Produk</h2>
          <p className="text-sm text-muted-foreground">
            {data.length} produk induk
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle: cards ⇄ table */}
          <div className="flex items-center gap-0.5 rounded-full bg-black/[0.06] p-1 ring-1 ring-border/60 dark:bg-white/10">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-7 rounded-full",
                view === "card"
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:bg-transparent hover:text-foreground"
              )}
              onClick={() => setView("card")}
              aria-label="Tampilan kartu"
              aria-pressed={view === "card"}
            >
              <LayoutGridIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-7 rounded-full",
                view === "table"
                  ? "bg-background text-foreground shadow-sm hover:bg-background"
                  : "text-muted-foreground hover:bg-transparent hover:text-foreground"
              )}
              onClick={() => setView("table")}
              aria-label="Tampilan tabel"
              aria-pressed={view === "table"}
            >
              <TableIcon className="size-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => toast("Impor produk", { description: "Segera hadir" })}
          >
            <UploadIcon className="size-4" />
            <span className="hidden sm:inline">Impor</span>
          </Button>
          <Button
            size="sm"
            className="h-9 gap-2"
            onClick={() => router.push("/dashboard/master-produk/buat")}
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Tambah Produk</span>
          </Button>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {view === "card" ? (
          <ProductCardView data={data} />
        ) : (
          <ProductTable data={data} />
        )}
      </div>
    </LiquidGlass>
  )
}
