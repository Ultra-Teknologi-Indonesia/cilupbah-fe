"use client"

import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProductListQuery } from "@/hooks/master-produk/use-product-list-query"
import { ProductExplorer } from "./product-explorer"



export function ProductMasterView() {
  const query = useProductListQuery()
  const { isError, isFetching, refetch } = query.result

  return (
    <>
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
        <ProductExplorer query={query} />
      )}
    </>
  )
}
