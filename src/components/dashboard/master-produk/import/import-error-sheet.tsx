"use client"

import * as React from "react"
import type { PaginationState } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  DownloadIcon,
  SearchXIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DataTable } from "@/components/ui/data-table"
import { useImportBatchErrors } from "@/hooks/master-produk/use-import"
import {
  ImportService,
  type ImportBatch,
  type ImportBatchError,
} from "@/services/master-produk/import.service"

const columns: ColumnDef<ImportBatchError>[] = [
  {
    accessorKey: "rowNumber",
    header: "Baris",
    size: 70,
    cell: ({ row }) => (
      <span className="font-mono tabular-nums">{row.original.rowNumber}</span>
    ),
  },
  {
    accessorKey: "attribute",
    header: "Kolom",
    size: 140,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.attribute}</span>
    ),
  },
  {
    accessorKey: "message",
    header: "Pesan Error",
    cell: ({ row }) => (
      <span className="text-destructive">{row.original.message}</span>
    ),
  },
]

interface Props {
  batch: ImportBatch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportErrorSheet({ batch, open, onOpenChange }: Props) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

  React.useEffect(() => {
    if (open) setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [open])

  const query = useImportBatchErrors(batch?.id ?? null, {
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  const items = query.data?.items ?? []
  const total = query.data?.meta?.total ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Error Import — {batch?.batchNo}</SheetTitle>
          <SheetDescription>
            {batch?.originalFilename} · {batch?.failedRows ?? 0} baris gagal
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 pt-4">
          {batch && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a
                  href={ImportService.errorsDownloadUrl(batch.id)}
                  download
                >
                  <DownloadIcon className="size-4" />
                  Download Error Report
                </a>
              </Button>
            </div>
          )}

          {query.isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangleIcon className="size-8 text-destructive" />
              <p className="font-medium">Gagal memuat error</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
              >
                Coba lagi
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              isLoading={query.isLoading}
              getRowId={(e) => `${e.rowNumber}-${e.attribute}`}
              hideToolbar
              manualPagination
              rowCount={total}
              pagination={pagination}
              onPaginationChange={setPagination}
              tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              emptyState={
                <div className="flex flex-col items-center gap-2 py-6">
                  <SearchXIcon className="size-8 text-muted-foreground" />
                  <p className="font-medium">Tidak ada error</p>
                </div>
              }
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
