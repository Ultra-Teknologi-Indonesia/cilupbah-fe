"use client"

import * as React from "react"
import type { PaginationState } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  Loader2Icon,
  PlusIcon,
  RocketIcon,
  SearchXIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import {
  useNaikkanDetail,
  useNaikkanHistory,
  useUpdateNaikkanProduct,
  useRemoveNaikkanProduct,
  useExecuteRaise,
  useAddNaikkanProduct,
} from "@/hooks/master-produk/use-naikkan"
import type { RaiseProductDetail } from "@/services/master-produk/naikkan.service"
import type { ChannelCode } from "@/types/channel"
import { buildProdukColumns } from "./naikkan-produk-columns"
import { aktivitasColumns } from "./naikkan-aktivitas-columns"
import { NaikkanProdukPickerDialog } from "./naikkan-produk-picker-dialog"

type TabValue = "produk" | "aktivitas"

export function NaikkanDetailView({ id }: { id: string }) {
  const [tab, setTab] = React.useState<TabValue>("produk")
  const [produkPagination, setProdukPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const [historyPagination, setHistoryPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  const detailQuery = useNaikkanDetail(id, {
    page: produkPagination.pageIndex + 1,
    perPage: produkPagination.pageSize,
  })

  const historyQuery = useNaikkanHistory(id, {
    page: historyPagination.pageIndex + 1,
    perPage: historyPagination.pageSize,
  })

  const store = detailQuery.data?.store
  const details = detailQuery.data?.details ?? []
  const detailMeta = detailQuery.data?.meta
  const historyItems = historyQuery.data?.items ?? []
  const historyMeta = historyQuery.data?.meta

  const updateMut = useUpdateNaikkanProduct(id)
  const removeMut = useRemoveNaikkanProduct(id)
  const raiseMut = useExecuteRaise(id)
  const addMut = useAddNaikkanProduct(id)

  const [removeTarget, setRemoveTarget] = React.useState<RaiseProductDetail | null>(null)
  const [showPicker, setShowPicker] = React.useState(false)
  const [showRaiseConfirm, setShowRaiseConfirm] = React.useState(false)

  const existingMappingIds = React.useMemo(
    () => new Set(details.map((d) => d.raiseproductDetailId)),
    [details]
  )

  const produkColumns = React.useMemo(
    () =>
      buildProdukColumns({
        onToggleRepeatable: (detail, value) =>
          updateMut.mutate({
            detailId: detail.raiseproductDetailId,
            data: { is_repeatable: value },
          }),
        onRemove: (detail) => setRemoveTarget(detail),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (detailQuery.isLoading) {
    return (
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex items-center justify-center py-20">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      </LiquidGlass>
    )
  }

  if (detailQuery.isError || !store) {
    return (
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangleIcon className="size-8 text-destructive" />
          <p className="font-medium">Gagal memuat data</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => detailQuery.refetch()}
            disabled={detailQuery.isFetching}
          >
            Coba lagi
          </Button>
        </div>
      </LiquidGlass>
    )
  }

  return (
    <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          {store.channelCode && (
            <ChannelLogo
              code={store.channelCode as ChannelCode}
              name={store.channelName ?? store.channelCode}
              className="size-9 rounded-lg text-[11px]"
            />
          )}
          <div>
            <h2 className="font-semibold">{store.storeName ?? "—"}</h2>
            <p className="text-xs text-muted-foreground">
              {store.channelName ?? store.channelCode} · {store.productActive} produk aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setShowPicker(true)}
          >
            <PlusIcon className="size-4" />
            Tambah Produk
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="h-9 gap-1.5"
            disabled={details.length === 0 || raiseMut.isPending}
            onClick={() => setShowRaiseConfirm(true)}
          >
            {raiseMut.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RocketIcon className="size-4" />
            )}
            Naikkan Produk
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60 px-4 pt-1 sm:px-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList variant="line">
            <TabsTrigger value="produk">Produk</TabsTrigger>
            <TabsTrigger value="aktivitas">Aktivitas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="px-4 py-5 sm:px-5">
        {tab === "produk" ? (
          <DataTable
            columns={produkColumns}
            data={details}
            isLoading={detailQuery.isFetching && !detailQuery.data}
            getRowId={(d) => d.raiseproductDetailId}
            hideToolbar
            manualPagination
            rowCount={detailMeta?.total ?? 0}
            pagination={produkPagination}
            onPaginationChange={setProdukPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-2 py-6">
                <SearchXIcon className="size-8 text-muted-foreground" />
                <p className="font-medium">Belum ada produk</p>
                <p className="text-sm text-muted-foreground">
                  Klik &ldquo;Tambah Produk&rdquo; untuk menambahkan produk channel.
                </p>
              </div>
            }
          />
        ) : (
          <DataTable
            columns={aktivitasColumns}
            data={historyItems}
            isLoading={historyQuery.isLoading}
            getRowId={(d) => `${d.raiseproductDetailId}-${d.endTime}`}
            hideToolbar
            manualPagination
            rowCount={historyMeta?.total ?? 0}
            pagination={historyPagination}
            onPaginationChange={setHistoryPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-2 py-6">
                <SearchXIcon className="size-8 text-muted-foreground" />
                <p className="font-medium">Belum ada aktivitas</p>
                <p className="text-sm text-muted-foreground">
                  Riwayat naikkan produk akan tampil di sini.
                </p>
              </div>
            }
          />
        )}
      </div>

      {/* Product Picker */}
      <NaikkanProdukPickerDialog
        open={showPicker}
        onOpenChange={setShowPicker}
        shopId={store.storeId}
        existingMappingIds={existingMappingIds}
        onAdd={(mappingId) => {
          addMut.mutate(mappingId, {
            onSuccess: () => {
              // keep dialog open for adding more
            },
          })
        }}
        addingId={addMut.isPending ? (addMut.variables as string) : null}
      />

      {/* Remove Confirm */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Hapus Produk dari Naikkan?"
        description={`Produk "${removeTarget?.itemGroupName}" akan dilepas dari daftar naikkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={removeMut.isPending}
        onConfirm={() => {
          if (!removeTarget) return
          removeMut.mutate(removeTarget.raiseproductDetailId, {
            onSuccess: () => setRemoveTarget(null),
          })
        }}
      />

      {/* Raise Confirm */}
      <ConfirmDialog
        open={showRaiseConfirm}
        onOpenChange={setShowRaiseConfirm}
        title="Naikkan Semua Produk?"
        description="Semua produk aktif akan diantrekan untuk dinaikkan di Shopee. Proses berjalan di background."
        confirmLabel="Naikkan"
        loading={raiseMut.isPending}
        onConfirm={() => {
          raiseMut.mutate(undefined, {
            onSuccess: () => setShowRaiseConfirm(false),
          })
        }}
      />
    </LiquidGlass>
  )
}
