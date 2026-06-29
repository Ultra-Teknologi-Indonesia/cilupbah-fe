"use client"

import { useMemo, useState } from "react"
import {
  AlertCircleIcon,
  FilterIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useHppReport } from "@/hooks/laporan/use-hpp-report"
import type { HppReportParams } from "@/types/laporan/hpp"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatDateISO(d: Date) {
  // YYYY-MM-DD (local, hindari shift TZ saat toISOString)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatDateID(d: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

interface RowProps {
  label: string
  value: number
  sign?: "+" | "-" | ""
  emphasized?: boolean
  separator?: "none" | "thin" | "double"
}

function RowLine({
  label,
  value,
  sign = "",
  emphasized,
  separator = "none",
}: RowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 px-1 py-2",
        separator === "thin" && "border-t border-border/40",
        separator === "double" &&
          "border-t-2 border-double border-foreground/60",
        emphasized && "text-base font-semibold",
      )}
    >
      <div className="flex items-center gap-2 text-foreground">
        {sign && (
          <span className="w-3 text-center text-muted-foreground">{sign}</span>
        )}
        <span>{label}</span>
      </div>
      <span className="tabular-nums text-foreground">
        {formatCurrency(value)}
      </span>
    </div>
  )
}

function HppSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

export function HppReportView() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth())
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date())
  const [locationId, setLocationId] = useState<string>("")

  // Trigger fetch hanya setelah klik "Terapkan" supaya UX terduga.
  const [appliedParams, setAppliedParams] = useState<HppReportParams | null>(
    () => ({
      date_from: formatDateISO(startOfMonth()),
      date_to: formatDateISO(new Date()),
    }),
  )

  const { data: locData } = useLocations({ perPage: 100 })

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? [])
        .filter((l) => l.isWarehouse && l.locationType !== "TRANSIT")
        .map((l) => ({ value: l.id, label: l.locationName })),
    ],
    [locData],
  )

  const canApply = Boolean(dateFrom && dateTo)

  const {
    data: report,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useHppReport(
    appliedParams ?? { date_from: "", date_to: "" },
    Boolean(appliedParams),
  )

  function handleApply() {
    if (!dateFrom || !dateTo) return
    setAppliedParams({
      date_from: formatDateISO(dateFrom),
      date_to: formatDateISO(dateTo),
      location_id: locationId || undefined,
    })
  }

  const payload = report?.data
  const d = payload?.data

  const selisih = useMemo(() => {
    if (!d) return 0
    return d.hpp - d.hpp_periode_snapshot
  }, [d])

  const errorMessage = useMemo(() => {
    if (!error) return null
    const err = error as { message?: string }
    return err?.message || "Gagal memuat laporan HPP."
  }, [error])

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04] p-5"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <FilterIcon className="h-4 w-4" />
          Filter Periode
        </div>
        <div className="grid items-end gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Tanggal Mulai
            </Label>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Pilih tanggal"
              className="bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Tanggal Akhir
            </Label>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="Pilih tanggal"
              className="bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Lokasi</Label>
            <Combobox
              options={locationOptions}
              value={locationId}
              onChange={(v) => setLocationId(v ?? "")}
              placeholder="Semua Lokasi"
              searchPlaceholder="Cari lokasi..."
              className="bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={!canApply || isFetching}
            >
              {isFetching ? (
                <Loader2Icon className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <FilterIcon className="mr-1.5 h-3.5 w-3.5" />
              )}
              Terapkan
            </Button>
            {appliedParams && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Muat ulang"
              >
                <RefreshCwIcon className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </LiquidGlass>

      {/* Hasil */}
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04] p-5"
      >
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Laporan Harga Pokok Penjualan (HPP)
            </h3>
            {payload && (
              <p className="text-xs text-muted-foreground">
                Periode: {formatDateID(payload.period.date_from)} –{" "}
                {formatDateID(payload.period.date_to)}
                {payload.period.location_id ? " · Lokasi terfilter" : ""}
              </p>
            )}
          </div>
          {payload && (
            <p className="text-xs text-muted-foreground">
              Dibuat: {new Date(payload.generated_at).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading && !d ? (
          <HppSkeleton />
        ) : d ? (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-border/40 bg-background/40 p-4 text-sm">
              <RowLine
                label="Persediaan Awal Barang Dagang"
                value={d.persediaan_awal}
                emphasized
              />

              <div className="mt-2 border-t border-border/40 pt-2">
                <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Pembelian Bersih
                </div>
                <RowLine
                  label="Pembelian Bruto"
                  value={d.pembelian_bruto}
                  sign="+"
                />
                <RowLine
                  label="Ongkos Angkut"
                  value={d.ongkos_angkut}
                  sign="+"
                />
                <RowLine
                  label="Retur Pembelian"
                  value={d.retur_pembelian}
                  sign="-"
                />
                <RowLine
                  label="Potongan Pembelian"
                  value={d.potongan_pembelian}
                  sign="-"
                />
                <RowLine
                  label="Pembelian Bersih"
                  value={d.pembelian_bersih}
                  separator="thin"
                  emphasized
                />
              </div>

              <div className="mt-2">
                <RowLine
                  label="Barang Tersedia Dijual"
                  value={d.barang_tersedia}
                  separator="thin"
                  emphasized
                />
                <RowLine
                  label="Persediaan Akhir"
                  value={d.persediaan_akhir}
                  sign="-"
                />
                <RowLine
                  label="Harga Pokok Penjualan (HPP)"
                  value={d.hpp}
                  separator="double"
                  emphasized
                />
              </div>

              <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">
                    Cross-check: COGS Snapshot Invoice
                  </span>
                  <span className="tabular-nums text-foreground">
                    {formatCurrency(d.hpp_periode_snapshot)}
                  </span>
                </div>
                {selisih !== 0 && (
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-muted-foreground">Selisih</span>
                    <span
                      className={cn(
                        "tabular-nums",
                        Math.abs(selisih) > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground",
                      )}
                    >
                      {formatCurrency(selisih)}
                    </span>
                  </div>
                )}
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  HPP dihitung dari saldo persediaan + pembelian bersih -
                  persediaan akhir. Snapshot COGS adalah total `total_cogs` dari
                  sales invoice items terbit di periode (cross-check;
                  perbedaan dapat terjadi karena timing posting).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Pilih periode lalu klik &quot;Terapkan&quot; untuk menampilkan laporan.
          </div>
        )}
      </LiquidGlass>
    </div>
  )
}
