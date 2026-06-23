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
  usePacklistDetail,
  useStartPacklist,
  useVerifyBarcode,
  usePackItem,
  useCompletePacklist,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { PACKLIST_STATUS_LABEL, type PacklistItem } from "@/types/proses-pesanan/fulfillment"

const LIST_HREF = "/dashboard/proses-pesanan"

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string" && m) return m
  }
  return fallback
}

function PackRow({
  item,
  disabled,
  onSave,
}: {
  item: PacklistItem
  disabled: boolean
  onSave: (itemId: string, qty: number) => void
}) {
  const [qty, setQty] = React.useState(String(item.qtyPacked))
  React.useEffect(() => setQty(String(item.qtyPacked)), [item.qtyPacked])

  const done = item.qtyPacked >= item.qtyOrdered
  const changed = (Number.parseInt(qty, 10) || 0) !== item.qtyPacked

  return (
    <tr className={cn("border-b border-border/60 last:border-0", done && "bg-emerald-500/[0.04]")}>
      <td className="px-3 py-2.5">
        <div className="font-medium text-foreground">{item.sku}</div>
        {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
      </td>
      <td className="px-3 py-2.5 tabular-nums">{item.qtyOrdered}</td>
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
      <td className="px-3 py-2.5 text-center">
        {item.barcodeVerified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckIcon className="size-3.5" /> Terverifikasi
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Belum</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {done ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckIcon className="size-3.5" /> Selesai
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Kurang {item.qtyOrdered - item.qtyPacked}</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || !changed}
          onClick={() => onSave(item.id, Math.min(item.qtyOrdered, Number.parseInt(qty, 10) || 0))}
        >
          Simpan
        </Button>
      </td>
    </tr>
  )
}

export function PackingDetailView({ id }: { id: string }) {
  const router = useRouter()
  const scanRef = React.useRef<HTMLInputElement>(null)
  const [scan, setScan] = React.useState("")

  const { data: pk, isLoading, isError } = usePacklistDetail(id)
  const startPacklist = useStartPacklist()
  const verifyBarcode = useVerifyBarcode()
  const packItem = usePackItem()
  const completePacklist = useCompletePacklist()

  const items = pk?.items ?? []
  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0)
  const totalPacked = items.reduce((s, i) => s + i.qtyPacked, 0)
  const allPacked = items.length > 0 && items.every((i) => i.qtyPacked >= i.qtyOrdered)
  const isTerminal = pk ? ["COMPLETED", "CANCELLED"].includes(pk.status) : false
  const editable = !!pk && !isTerminal

  const savePack = (itemId: string, qty: number) => {
    packItem.mutate(
      { packlistId: id, itemId, qtyPacked: qty },
      {
        onSuccess: () => toast.success("Qty kemas tersimpan."),
        onError: (e) => toast.error(errMsg(e, "Gagal menyimpan kemas.")),
      }
    )
  }

  const handleScan = () => {
    const code = scan.trim()
    if (!code) return
    setScan("")
    scanRef.current?.focus()
    verifyBarcode.mutate(
      { packlistId: id, barcode: code },
      {
        onSuccess: (res) => {
          if (!res) {
            toast.error(`Barcode "${code}" tidak cocok.`)
            return
          }
          const item = items.find((i) => i.id === res.itemId)
          // Verifikasi sekaligus tambah 1 kemasan bila masih kurang.
          if (item && item.qtyPacked < item.qtyOrdered) {
            savePack(item.id, item.qtyPacked + 1)
          } else {
            toast.success(`${res.sku} terverifikasi.`)
          }
        },
        onError: (e) => toast.error(errMsg(e, "Barcode tidak valid.")),
      }
    )
  }

  const handleComplete = () => {
    completePacklist.mutate(id, {
      onSuccess: () => {
        toast.success("Packing selesai.")
        router.push(LIST_HREF)
      },
      onError: (e) => toast.error(errMsg(e, "Gagal menyelesaikan packing.")),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={pk ? `Packing ${pk.packlistNo}` : "Packing"}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Packing" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href={LIST_HREF} prefetch={false}>
              <ArrowLeftIcon /> Kembali
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Memuat packlist…
        </div>
      ) : isError || !pk ? (
        <div className="py-24 text-center text-sm text-destructive">Gagal memuat packlist.</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <span
                  className={cn(
                    "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    PACKLIST_STATUS_LABEL[pk.status].className
                  )}
                >
                  {PACKLIST_STATUS_LABEL[pk.status].label}
                </span>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">No. Pesanan</div>
                <div className="font-medium">{pk.orderNo ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Packer</div>
                <div className="font-medium">{pk.packerName ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="font-medium tabular-nums">
                  {totalPacked} / {totalOrdered}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pk.status === "DRAFT" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    startPacklist.mutate(id, {
                      onSuccess: () => toast.success("Packing dimulai."),
                      onError: (e) => toast.error(errMsg(e, "Gagal memulai packing.")),
                    })
                  }
                  disabled={startPacklist.isPending}
                >
                  Mulai Packing
                </Button>
              )}
              {editable && (
                <Button variant="primary" onClick={handleComplete} disabled={!allPacked || completePacklist.isPending}>
                  {completePacklist.isPending && <Loader2Icon className="animate-spin" />}
                  Selesaikan
                </Button>
              )}
            </div>
          </div>

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
                placeholder="Scan barcode / SKU lalu Enter…"
                className="pl-9"
                autoFocus
              />
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-3 py-3 font-medium">SKU / Produk</th>
                  <th className="px-3 py-3 font-medium">Qty Dipesan</th>
                  <th className="px-3 py-3 font-medium">Qty Dikemas</th>
                  <th className="px-3 py-3 text-center font-medium">Barcode</th>
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
                    <PackRow key={item.id} item={item} disabled={!editable} onSave={savePack} />
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
