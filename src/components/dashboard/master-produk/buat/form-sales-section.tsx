"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FormSectionCard } from "@/components/ui/form-section-card";
import { MoneyInput } from "@/components/ui/money-input";
import type { BuatProdukFormValues } from "@/types/master-produk";

export function FormSalesSection() {
  const { control } = useFormContext<BuatProdukFormValues>();

  return (
    <FormSectionCard id="penjualan" title="Informasi Penjualan & Pembelian">
      <div className="grid gap-5 sm:max-w-xs">
        <FormField
          control={control}
          name="sellPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Harga jual default <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionCard>
  );
}
