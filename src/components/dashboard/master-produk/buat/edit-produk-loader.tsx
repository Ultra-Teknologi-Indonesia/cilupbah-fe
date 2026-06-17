"use client"

import Link from "next/link"
import { PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProductDetail } from "@/hooks/master-produk/use-product-detail"
import { ProductDetailSkeleton } from "../detail/product-detail-skeleton"
import { EditProdukForm } from "./edit-produk-form"

export function EditProdukLoader({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useProductDetail(id)

  if (isLoading) return <ProductDetailSkeleton />

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <PackageIcon className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium">Produk tidak ditemukan</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba lagi
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/dashboard/master-produk" prefetch={false}>Kembali ke daftar</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <EditProdukForm product={data} />
}
