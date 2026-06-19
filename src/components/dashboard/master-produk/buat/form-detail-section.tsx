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
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Combobox } from "@/components/ui/combobox"
import { Switch } from "@/components/ui/switch"

import { FormSectionCard } from "@/components/ui/form-section-card"
import { CategoryPicker } from "./category-picker"
import { BundleBuilder } from "./bundle-builder"
import type { BuatProdukFormValues, SelectedCategory } from "@/types/master-produk"
import {
  useBrandOptions,
  useCategoryTree,
} from "@/hooks/master-produk/use-master-data"

export function FormDetailSection({
  skuDisabled = false,
  mode = "full",
}: {
  skuDisabled?: boolean
  mode?: "full" | "bundle"
} = {}) {
  const { control, watch } = useFormContext()
  const isPreorder = mode === "full" ? watch("isPreorder") : false
  const isBundle = mode === "bundle"
  const { data: brandOptions = [] } = useBrandOptions()
  const { data: categoryTree = [] } = useCategoryTree()

  return (
    <FormSectionCard id="detail" title="Detail Produk">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Produk <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="mis. Resistance Band Set Premium Anti Slip 5 Tingkat" {...field} />
              </FormControl>
              <FormDescription>
                Minimal 25 karakter agar bisa diupload ke TikTok ({(field.value ?? "").trim().length}/25).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Merek</FormLabel>
              <FormControl>
                <Combobox
                  options={brandOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pilih merek"
                />
              </FormControl>
              <FormDescription>Pilih merek, atau isi kolom Merek Lainnya</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Kategori <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <CategoryPicker
                  value={field.value as SelectedCategory | null}
                  onChange={field.onChange}
                  tree={categoryTree}
                  invalid={fieldState.invalid}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="brandOther"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Merek Lainnya</FormLabel>
              <FormControl>
                <Input placeholder="Nama merek baru" {...field} />
              </FormControl>
              <FormDescription>Opsional — buat merek baru</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="mis. RB-SET-5PCS" maxLength={50} disabled={skuDisabled} {...field} />
              </FormControl>
              {skuDisabled && (
                <FormDescription>SKU tidak dapat diubah setelah produk dibuat.</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-5">
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  rows={6}
                  placeholder="Jelaskan keunggulan produk…"
                />
              </FormControl>
              <FormDescription>
                Opsional. Jika diisi, minimal 30 karakter.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {mode === "full" && (
        <div className="mt-6 border-t pt-5">
          <h4 className="mb-3 text-sm font-medium">Tipe Produk</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={control}
              name="isConsignment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Produk Konsinyasi</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="isPreorder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Pre-Order</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          {isPreorder && (
            <div className="mt-4 max-w-xs">
              <FormField
                control={control}
                name="indentDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lama indent (hari) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="mis. 7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}

      {mode === "bundle" && (
        <div className="mt-6 border-t pt-5">
          <FormField
            control={control}
            name="bundleComponents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Komposisi Bundle <span className="text-destructive">*</span></FormLabel>
                <FormDescription>
                  Pilih produk komponen beserta jumlahnya. Bundle dijual sebagai 1 SKU; stoknya dihitung
                  otomatis dari komponen.
                </FormDescription>
                <FormControl>
                  <BundleBuilder value={field.value ?? []} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </FormSectionCard>
  )
}
