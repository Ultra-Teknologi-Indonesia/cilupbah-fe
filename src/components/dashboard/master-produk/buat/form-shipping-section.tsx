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
import { Textarea } from "@/components/ui/textarea"

import { FormSectionCard } from "@/components/ui/form-section-card"
import type { BuatProdukFormValues } from "@/types/master-produk"

export function FormShippingSection() {
  const { control } = useFormContext<BuatProdukFormValues>()

  return (
    <FormSectionCard id="pengiriman" title="Informasi Pengiriman">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Berat paket (gram) <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Panjang (cm)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lebar (cm)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tinggi (cm)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-5">
        <FormField
          control={control}
          name="packageContents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Isi paket</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="mis. 5 band + pouch + panduan" {...field} />
              </FormControl>
              <FormDescription>Opsional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  )
}
