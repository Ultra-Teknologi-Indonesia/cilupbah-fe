"use client"

import * as React from "react"
import { ScanBarcodeIcon, ListChecksIcon, CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { playScanFeedback } from "@/lib/scan-feedback"

/**
 * Baris scan terpadu untuk semua flow gudang (picking / packing / putaway).
 *
 * Dua cara pilih item — UX-nya identik di semua flow:
 *  - **Scanner / ketik kode** → tekan Enter → auto-cocokkan ke baris (SKU/barcode/serial/batch) → auto-pilih.
 *  - **Combobox "Pilih manual"** → cari & pilih baris dari daftar.
 *
 * Keduanya memanggil `onResolve(line)` yang sama → auto-flow di parent (increment qty,
 * buka input qty, tambah placement, dst). Fokus balik ke input scan otomatis.
 */
export interface ScanAutoflowLine {
  /** id unik baris (item/line id). */
  id: string
  /** teks utama, mis. nama produk. */
  primary: string
  /** teks sekunder, mis. SKU. */
  secondary?: string
  /** semua kode yang bisa di-scan untuk baris ini (sku, barcode, serial_no, batch_no). */
  codes: string[]
  /** baris sudah selesai diproses → di-nonaktifkan di combobox & dilewati saat scan. */
  done?: boolean
}

interface ScanAutoflowBarProps {
  lines: ScanAutoflowLine[]
  /** dipanggil saat baris terpilih (via scan ATAU combobox). */
  onResolve: (line: ScanAutoflowLine) => void
  /** fallback saat kode tak cocok lokal (mis. verify-barcode ke BE). return true bila tertangani. */
  onUnmatched?: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
  scanPlaceholder?: string
  manualPlaceholder?: string
  hint?: string
  className?: string
  /** ubah nilai ini untuk memaksa fokus balik ke input scan (mis. setelah modal qty ditutup). */
  refocusKey?: number | string
  /** bunyi + getar feedback tiap scan (default true). */
  sound?: boolean
  /**
   * Tangani kode SEBELUM pencocokan baris (mis. scan rak di picking → set rak aktif).
   * Return true bila kode sudah ditangani (bar cukup beri feedback ok & bersihkan input).
   */
  interceptCode?: (code: string) => boolean
}

function normalize(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, "")
}

export function ScanAutoflowBar({
  lines,
  onResolve,
  onUnmatched,
  disabled,
  autoFocus = true,
  scanPlaceholder = "Scan / ketik kode lalu Enter…",
  manualPlaceholder = "Pilih manual…",
  hint = "Gunakan scanner, atau pilih manual lewat dropdown.",
  className,
  refocusKey,
  sound = true,
  interceptCode,
}: ScanAutoflowBarProps) {
  const [code, setCode] = React.useState("")
  const [flash, setFlash] = React.useState<"ok" | "err" | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (autoFocus && !disabled) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [autoFocus, disabled])

  const focusScan = React.useCallback(() => {
    inputRef.current?.focus()
  }, [])

  React.useEffect(() => {
    if (refocusKey === undefined || disabled) return
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [refocusKey, disabled])

  const flashState = React.useCallback((s: "ok" | "err") => {
    setFlash(s)
    if (sound) playScanFeedback(s === "ok" ? "ok" : "error")
    setTimeout(() => setFlash(null), 350)
  }, [sound])

  const resolveByCode = React.useCallback(
    (raw: string) => {
      const n = normalize(raw)
      if (!n) return

      // Kode ditangani parent lebih dulu (mis. scan rak → set rak aktif).
      if (interceptCode?.(raw.trim())) {
        flashState("ok")
        setCode("")
        focusScan()
        return
      }

      // Prioritaskan baris yang belum selesai, lalu baris apa pun yang cocok.
      const pending = lines.find(
        (l) => !l.done && l.codes.some((c) => normalize(c) === n)
      )
      const anyMatch = pending ?? lines.find((l) => l.codes.some((c) => normalize(c) === n))

      if (anyMatch) {
        onResolve(anyMatch)
        flashState("ok")
      } else if (onUnmatched) {
        onUnmatched(raw.trim())
      } else {
        flashState("err")
      }
      setCode("")
      focusScan()
    },
    [lines, onResolve, onUnmatched, flashState, focusScan, interceptCode]
  )

  const manualOptions = React.useMemo(
    () =>
      lines.map((l) => ({
        value: l.id,
        label: l.primary,
        hint: [l.secondary, l.done ? "✓ selesai" : null].filter(Boolean).join(" · ") || undefined,
      })),
    [lines]
  )

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <ScanBarcodeIcon
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
              flash === "ok" ? "text-emerald-500" : flash === "err" ? "text-destructive" : "text-muted-foreground"
            )}
          />
          <Input
            ref={inputRef}
            value={code}
            disabled={disabled}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                resolveByCode(code)
              }
            }}
            placeholder={scanPlaceholder}
            className={cn(
              "h-11 pl-9 text-base transition-colors",
              flash === "ok" && "border-emerald-500 ring-2 ring-emerald-500/30",
              flash === "err" && "border-destructive ring-2 ring-destructive/30"
            )}
            aria-label="Scan kode"
            autoComplete="off"
            inputMode="text"
          />
        </div>

        {lines.length > 0 && (
          <div className="flex items-center gap-2 sm:w-64">
            <ListChecksIcon className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
            <Combobox
              options={manualOptions}
              value={null}
              onChange={(v) => {
                if (!v) return
                const line = lines.find((l) => l.id === v)
                if (line) {
                  onResolve(line)
                  flashState("ok")
                  focusScan()
                }
              }}
              placeholder={manualPlaceholder}
              searchPlaceholder="Cari produk / SKU…"
              emptyText="Tidak ada item."
              disabled={disabled}
              className="h-11 flex-1"
            />
          </div>
        )}
      </div>
      {hint && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckIcon className="size-3" />
          {hint}
        </p>
      )}
    </div>
  )
}
