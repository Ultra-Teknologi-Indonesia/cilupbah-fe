"use client"

import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"

import { cn } from "@/lib/utils"
import { FormSectionCard } from "@/components/ui/form-section-card"
import { MoneyInput } from "@/components/ui/money-input"
import { ShopMultiSelect } from "./shop-multiselect"
import type { BuatProdukFormValues } from "@/types/master-produk"
import {
  useCogsAccounts,
  useInventoryAccounts,
  usePurchaseTaxes,
  useSalesAccounts,
  useSalesReturnAccounts,
  useSalesTaxes,
  useShopOptions,
} from "@/hooks/master-produk/use-master-data"

function taxHint(rate: number | undefined, price?: string): string | undefined {
  if (!rate) return undefined
  const p = Number(price || 0)
  if (!p) return `Tarif ${rate}%`
  const tax = Math.round((p * rate) / 100)
  return `Tarif ${rate}% → Rp ${tax.toLocaleString("id-ID")}`
}

const ACCOUNT_DEFAULT_HINT = "Dikosongkan = pakai akun default perusahaan"

export function FormSalesSection() {
  const { control, watch } = useFormContext<BuatProdukFormValues>()
  const v = watch()
  const { data: salesTax } = useSalesTaxes()
  const { data: purchaseTax } = usePurchaseTaxes()
  const { data: salesAccounts = [] } = useSalesAccounts()
  const { data: salesReturnAccounts = [] } = useSalesReturnAccounts()
  const { data: inventoryAccounts = [] } = useInventoryAccounts()
  const { data: cogsAccounts = [] } = useCogsAccounts()
  const { data: shopOptions = [] } = useShopOptions()

  return (
    <FormSectionCard id="penjualan" title="Informasi Penjualan & Pembelian">
      <div className="grid gap-5 md:grid-cols-3">

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
          <FormField
            control={control}
            name="isStored"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 border-b border-border/60 pb-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Disimpan</FormLabel>
                  <FormDescription>Lacak stok (persediaan)</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className={cn("flex flex-col gap-4", !v.isStored && "pointer-events-none opacity-50")}>
            <FormField
              control={control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batas stok menipis</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="safeStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batas stok aman</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="unlimitedShopIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toko stok tidak terbatas</FormLabel>
                  <FormControl>
                    <ShopMultiSelect options={shopOptions} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Boleh lebih dari satu toko</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
          <FormField
            control={control}
            name="isSold"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 border-b border-border/60 pb-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Dijual</FormLabel>
                  <FormDescription>Tampil di penjualan</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className={cn("flex flex-col gap-4", !v.isSold && "pointer-events-none opacity-50")}>
            <FormField
              control={control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga jual default {v.isSold && <span className="text-destructive">*</span>}</FormLabel>
                  <FormControl>
                    <MoneyInput placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="salesTaxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pajak penjualan</FormLabel>
                  <FormControl>
                    <Combobox options={salesTax?.options ?? []} value={field.value} onChange={field.onChange} placeholder="Pilih pajak" />
                  </FormControl>
                  <FormDescription>{taxHint(field.value ? salesTax?.rateById[field.value] : undefined, v.sellPrice)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="salesAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akun Penjualan</FormLabel>
                  <FormControl>
                    <Combobox options={salesAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                  </FormControl>
                  <FormDescription>{ACCOUNT_DEFAULT_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="salesReturnAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retur Penjualan</FormLabel>
                  <FormControl>
                    <Combobox options={salesReturnAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                  </FormControl>
                  <FormDescription>{ACCOUNT_DEFAULT_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
          <FormField
            control={control}
            name="isPurchased"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 border-b border-border/60 pb-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Dibeli</FormLabel>
                  <FormDescription>Tampil di pembelian</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className={cn("flex flex-col gap-4", !v.isPurchased && "pointer-events-none opacity-50")}>
            <FormField
              control={control}
              name="buyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga beli</FormLabel>
                  <FormControl>
                    <MoneyInput placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="purchaseTaxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pajak pembelian</FormLabel>
                  <FormControl>
                    <Combobox options={purchaseTax?.options ?? []} value={field.value} onChange={field.onChange} placeholder="Pilih pajak" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="inventoryAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akun Persediaan</FormLabel>
                  <FormControl>
                    <Combobox options={inventoryAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                  </FormControl>
                  <FormDescription>{ACCOUNT_DEFAULT_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="cogsAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akun HPP</FormLabel>
                  <FormControl>
                    <Combobox options={cogsAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                  </FormControl>
                  <FormDescription>{ACCOUNT_DEFAULT_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="purchaseLeadTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lama pembelian (hari)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </FormSectionCard>
  )
}
