"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, Loader2Icon, ScanLineIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  usePicklistDetail,
  useStartPicklist,
  usePickItem,
  useCompletePicklist,
  useFailPicklist,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { PICKLIST_STATUS_LABEL, type PicklistItem } from "@/types/proses-pesanan/fulfillment"

const LIST_HREF = "/dashboard/proses-pesanan"

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string" && m) return m
  }
  return fallback
}

function PickRow({
  item,
  disabled,
  onSave,
  saving,
}: {
  item: PicklistItem
  disabled: boolean
  onSave: (itemId: string, qty: number, binCode: string) => void
  saving: boolean
}) {
  const [qty, setQty] = React.useState(String(item.qtyPicked))
  const [bin, setBin] = React.useState(item.binCode ?? "")
  React.useEffect(() => setQty(String(item.qtyPicked)), [item.qtyPicked])
  React.useEffect(() => setBin(item.binCode ?? ""), [item.binCode])

  const done = item.qtyPicked >= item.qtyOrdered
  const changed = (Number.parseInt(qty, 10) || 0) !== item.qtyPicked

  return (
    <tr className={cn("border-b border-border/60 last:border-0", done && "bg-emerald-500/[0.04]")}>
      <td className="px-3 py-2.5">
        <div className="flex min-w-0 flex-col gap-0.5" style={{ maxWidth: 280 }}>
          <span className="font-medium whitespace-normal break-words text-foreground">
            {item.name ?? item.sku}
          </span>
          {item.name && (
            <span className="font-mono text-[11px] text-foreground/80">{item.sku}</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <Input
          value={bin}
          onChange={(e) => setBin(e.target.value)}
          disabled={disabled}
          placeholder="Kode rak"
          className="h-9 w-28"
        />
      </td>
      <td className="px-3 py-2.5 tabular-nums text-foreground">{item.qtyOrdered}</td>
      <td className="px-3 py-2.5">
        <Input
          type="number"
          min={0}
          max={item.qtyOrdered}
          inputMode="numeric"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          disabled={disabled}
          className="h-9 w-20"
        />
      </td>
      <td className="px-3 py-2.5">
        {done ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckIcon className="size-3.5" /> Selesai
          </span>
        ) : (
          <span className="text-xs text-foreground">
            Kurang {item.qtyOrdered - item.qtyPicked}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || !changed || !bin.trim() || saving}
          onClick={() => onSave(item.id, Math.min(item.qtyOrdered, Number.parseInt(qty, 10) || 0), bin.trim())}
        >
          Simpan
        </Button>
      </td>
    </tr>
  )
}

export function PickingDetailView({ id }: { id: string }) {
  const router = useRouter()
  const scanRef = React.useRef<HTMLInputElement>(null)
  const [scan, setScan] = React.useState("")

  const { data: pl, isLoading, isError } = usePicklistDetail(id)
  const startPicklist = useStartPicklist()
  const pickItem = usePickItem()
  const completePicklist = useCompletePicklist()
  const failPicklist = useFailPicklist()

  const items = pl?.items ?? []
  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0)
  const totalPicked = items.reduce((s, i) => s + i.qtyPicked, 0)
  const allPicked = items.length > 0 && items.every((i) => i.qtyPicked >= i.qtyOrdered)
  const isTerminal = pl ? ["COMPLETED", "FAILED", "CANCELLED"].includes(pl.status) : false
  const editable = !!pl && !isTerminal

  const savePick = (itemId: string, qty: number, binCode: string) => {
    pickItem.mutate(
      { picklistId: id, itemId, qtyPicked: qty, binCode },
      {
        onSuccess: () => toast.success("Qty pick tersimpan."),
        onError: (e) => toast.error(errMsg(e, "Gagal menyimpan pick.")),
      }
    )
  }

  const handleScan = () => {
    const code = scan.trim()
    if (!code) return
    const item = items.find((i) => i.sku.toLowerCase() === code.toLowerCase())
    setScan("")
    scanRef.current?.focus()
    if (!item) {
      toast.error(`SKU "${code}" tidak ada di picklist ini.`)
      return
    }
    if (item.qtyPicked >= item.qtyOrdered) {
      toast.info(`${item.sku} sudah lengkap.`)
      return
    }
    if (!item.binCode) {
      toast.error(`Isi kode rak untuk ${item.sku} terlebih dahulu.`)
      return
    }
    savePick(item.id, item.qtyPicked + 1, item.binCode)
  }

  const handleComplete = () => {
    completePicklist.mutate(id, {
      onSuccess: () => {
        toast.success("Picking selesai.")
        router.push(LIST_HREF)
      },
      onError: (e) => toast.error(errMsg(e, "Gagal menyelesaikan picking.")),
    })
  }

  const handleFail = () => {
    const reason = window.prompt("Alasan gagal picking (opsional):") ?? undefined
    failPicklist.mutate(
      { id, reason },
      {
        onSuccess: () => {
          toast.success("Picklist ditandai gagal.")
          router.push(LIST_HREF)
        },
        onError: (e) => toast.error(errMsg(e, "Gagal menandai picklist.")),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={pl ? `Picking ${pl.picklistNo}` : "Picking"}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Picking" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href={LIST_HREF}>
              <ArrowLeftIcon /> Kembali
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Memuat picklist…
        </div>
      ) : isError || !pl ? (
        <div className="py-24 text-center text-sm text-destructive">Gagal memuat picklist.</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <span
                  className={cn(
                    "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    PICKLIST_STATUS_LABEL[pl.status].className
                  )}
                >
                  {PICKLIST_STATUS_LABEL[pl.status].label}
                </span>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="font-medium">{pl.locationName ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Picker</div>
                <div className="font-medium">{pl.pickerName ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="font-medium tabular-nums">
                  {totalPicked} / {totalOrdered}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pl.status === "DRAFT" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    startPicklist.mutate(id, {
                      onSuccess: () => toast.success("Picking dimulai."),
                      onError: (e) => toast.error(errMsg(e, "Gagal memulai picking.")),
                    })
                  }
                  disabled={startPicklist.isPending}
                >
                  Mulai Picking
                </Button>
              )}
              {editable && (
                <Button variant="ghost" className="text-destructive" onClick={handleFail}>
                  Gagal
                </Button>
              )}
              {editable && (
                <Button variant="primary" onClick={handleComplete} disabled={!allPicked || completePicklist.isPending}>
                  {completePicklist.isPending && <Loader2Icon className="animate-spin" />}
                  Selesaikan
                </Button>
              )}
            </div>
          </div>

          {/* Scan */}
          {editable && (
            <div className="relative max-w-md">
              <ScanLineIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={scanRef}
                value={scan}
                onChange={(e) => setScan(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleScan()
                  }
                }}
                placeholder="Scan / ketik SKU lalu Enter…"
                className="pl-9"
                autoFocus
              />
            </div>
          )}

          {/* Items */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-3 py-3 font-medium">SKU / Produk</th>
                  <th className="px-3 py-3 font-medium">Bin</th>
                  <th className="px-3 py-3 font-medium">Qty Dipesan</th>
                  <th className="px-3 py-3 font-medium">Qty Dipick</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="w-24 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      Tidak ada item.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <PickRow
                      key={item.id}
                      item={item}
                      disabled={!editable}
                      onSave={savePick}
                      saving={pickItem.isPending}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
