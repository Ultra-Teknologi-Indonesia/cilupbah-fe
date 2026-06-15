"use client"

import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMasterProducts } from "@/hooks/master-produk/use-master-products"
import { ProductStats } from "./product-stats"
import { ProductExplorer } from "./product-explorer"

// Mengambil daftar master produk dari BE (GET /products/master) lalu memberi
// data ke stats + explorer. Filter/sort/paginasi masih sisi-klien atas set ini.
export function ProductMasterView() {
  const { data, isLoading, isError, isFetching, refetch } = useMasterProducts({
    perPage: 200,
  })
  const products = data?.items ?? []

  return (
    <>
      <ProductStats products={products} />

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/60 py-12 text-center backdrop-blur-xl">
          <AlertTriangleIcon className="size-8 text-destructive" />
          <div>
            <p className="font-medium">Gagal memuat produk</p>
            <p className="text-sm text-muted-foreground">
              Periksa koneksi atau coba lagi.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Coba lagi
          </Button>
        </div>
      ) : (
        <ProductExplorer data={products} isLoading={isLoading} />
      )}
    </>
  )
}
