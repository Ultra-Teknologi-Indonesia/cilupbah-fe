"use client"

import * as React from "react"

import { Combobox } from "@/components/ui/combobox"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"


export function ShopPicker({
  value,
  onChange,
  className,
}: {
  value: string | null
  onChange: (shopId: string | null) => void
  className?: string
}) {
  const { data: stores = [], isLoading } = useConnectedStores()

  const options = React.useMemo(
    () =>
      stores
        .filter((s) => s.is_active)
        .map((s) => ({
          value: s.shop_id,
          label: s.shop_name,
          hint: s.channel?.name ?? undefined,
        })),
    [stores]
  )

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "Memuat toko…" : "Pilih toko tujuan"}
      searchPlaceholder="Cari toko"
      disabled={isLoading}
      className={className}
    />
  )
}
