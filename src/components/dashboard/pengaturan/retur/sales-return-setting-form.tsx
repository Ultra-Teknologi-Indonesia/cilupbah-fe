"use client"

import { useMemo, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useSalesReturnSetting, useSaveSalesReturnSetting } from "@/hooks/barang-masuk/use-sales-return-setting"
import type { SalesReturnSetting } from "@/types/barang-masuk/sales-return-setting"

function SettingRow({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SettingFormBody({ initial }: { initial: SalesReturnSetting }) {
  const saveMut = useSaveSalesReturnSetting()
  const { data: locData } = useLocations({ perPage: 100 })

  const [autoAccept, setAutoAccept] = useState(!!initial.auto_accept)
  const [autoReceive, setAutoReceive] = useState(!!initial.auto_receive)
  const [restockLocation, setRestockLocation] = useState(initial.default_restock_location_id ?? "")
  const [validityDays, setValidityDays] = useState(initial.return_validity_days != null ? String(initial.return_validity_days) : "")
  const [conditions, setConditions] = useState((initial.allowed_conditions ?? []).join(", "))
  const [refundMethods, setRefundMethods] = useState((initial.allowed_refund_methods ?? []).join(", "))

  const locationOptions = useMemo(
    () => [
      { value: "", label: "— Ikuti lokasi order —" },
      ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
    ],
    [locData]
  )

  const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean)

  const handleSave = () => {
    saveMut.mutate({
      auto_accept: autoAccept,
      auto_receive: autoReceive,
      default_restock_location_id: restockLocation || null,
      return_validity_days: validityDays ? Number(validityDays) : null,
      allowed_conditions: splitList(conditions),
      allowed_refund_methods: splitList(refundMethods),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-col divide-y divide-border/60 px-5 py-2">
          <SettingRow title="Auto-terima retur (auto accept)" desc="Retur baru langsung disetujui otomatis tanpa review manual.">
            <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
          </SettingRow>
          <SettingRow title="Auto-restock (auto receive)" desc="Saat retur disetujui, barang langsung diterima kembali ke stok (tanpa langkah terima manual).">
            <Switch checked={autoReceive} onCheckedChange={setAutoReceive} />
          </SettingRow>
        </div>
      </LiquidGlass>

      <LiquidGlass radius={16} intensity="subtle" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Lokasi Restock Default</Label>
            <Combobox
              options={locationOptions}
              value={restockLocation}
              onChange={(v) => setRestockLocation(v ?? "")}
              placeholder="Ikuti lokasi order"
              searchPlaceholder="Cari gudang…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Batas Hari Retur</Label>
            <Input type="number" min={1} max={3650} value={validityDays} onChange={(e) => setValidityDays(e.target.value)} placeholder="Tanpa batas" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Kondisi Diizinkan</Label>
            <Input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="GOOD, DAMAGE" />
            <p className="text-xs text-muted-foreground">Pisahkan dengan koma.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Metode Refund Diizinkan</Label>
            <Input value={refundMethods} onChange={(e) => setRefundMethods(e.target.value)} placeholder="cash, transfer, store_credit" />
            <p className="text-xs text-muted-foreground">Pisahkan dengan koma.</p>
          </div>
        </div>
      </LiquidGlass>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMut.isPending}>
          {saveMut.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  )
}

export function SalesReturnSettingForm() {
  const { data: setting, isLoading } = useSalesReturnSetting()

  if (isLoading || !setting) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    )
  }

  // key memaksa re-init state saat data pertama termuat (hindari setState-in-effect).
  return <SettingFormBody key={setting.updated_at ?? "loaded"} initial={setting} />
}
