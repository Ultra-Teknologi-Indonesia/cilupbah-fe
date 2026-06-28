"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatIDR } from "../product-columns"
import { useProductPriceBook } from "@/hooks/master-produk/use-product-tabs"
import { TabPagination } from "./tab-pagination"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import type { PriceBookRow } from "@/services/master-produk/product-tabs.service"

const CUSTOMER_TYPE_LABEL: Record<string, string> = {
  retail: "Ritel",
  reseller: "Reseller",
  wholesaler: "Grosir",
  wholesale: "Grosir",
  distributor: "Distributor",
}


export function TabBukuHarga({ productId }: { productId: string }) {
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)
  const [sort, setSort] = React.useState("")

  const { data, isLoading, isError, refetch, isFetching } = useProductPriceBook(
    productId,
    { page, perPage, sort: sort || undefined },
    true
  )
  const rows = data?.items ?? []
  const lastPage = data?.meta?.last_page ?? 1

  const onSortChange = (columnId: string, isDesc: boolean) => {
    setSort(`${isDesc ? "-" : ""}${columnId}`)
    setPage(1)
  }

  const columns = React.useMemo<ColumnDef<PriceBookRow>[]>(() => [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <span className="font-mono text-xs text-primary">{row.original.sku ?? "—"}</span>,
    },
    {
      accessorKey: "customer_type",
      header: "Tipe pelanggan",
      cell: ({ row }) => <span>{row.original.customerType ? CUSTOMER_TYPE_LABEL[row.original.customerType] ?? row.original.customerType : "Semua"}</span>,
    },
    {
      accessorKey: "min_qty",
      header: () => <div className="text-right">Min qty</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.minQty ?? "—"}</div>,
    },
    {
      accessorKey: "max_qty",
      header: () => <div className="text-right">Max qty</div>,
      cell: ({ row }) => <div className="text-right tabular-nums">{row.original.maxQty ?? <span className="text-muted-foreground">∞</span>}</div>,
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Harga</div>,
      cell: ({ row }) => <div className="text-right font-medium tabular-nums">{formatIDR(row.original.price)}</div>,
    },
  ], []);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={{
            pageIndex: page - 1,
            pageSize: perPage,
          }}
          rowCount={data?.meta?.total ?? 0}
          onPaginationChange={(p) => {
            setPage(p.pageIndex + 1)
            setPerPage(p.pageSize)
          }}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            isError ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Gagal memuat.{" "}
                <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
                  Coba lagi
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Belum ada harga grosir.
              </div>
            )
          }
        />
      </div>


    </div>
  )
}
