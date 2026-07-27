"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

import { FormSectionCard } from "@/components/ui/form-section-card";
import { CategoryPicker } from "./category-picker";
import { BundleBuilder } from "./bundle-builder";
import type { SelectedCategory } from "@/types/master-produk";
import { useCategoryTree } from "@/hooks/master-produk/use-master-data";

export function FormDetailSection({
  skuDisabled = false,
  mode = "full",
}: {
  skuDisabled?: boolean;
  mode?: "full" | "bundle";
} = {}) {
  const { control } = useFormContext();
  const { data: categoryTree = [] } = useCategoryTree();

  return (
    <FormSectionCard id="detail" title="Detail Produk">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nama Produk <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="mis. Resistance Band Set Premium Anti Slip 5 Tingkat"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Minimal 25 karakter agar bisa diupload ke TikTok (
                {(field.value ?? "").trim().length}/25).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Kategori <span className="text-destructive">*</span>
              </FormLabel>
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
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                SKU{" "}
                <span className="text-muted-foreground font-normal">
                  (opsional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="mis. RB-SET-5PCS"
                  maxLength={50}
                  disabled={skuDisabled}
                  {...field}
                />
              </FormControl>
              {skuDisabled && (
                <FormDescription>
                  SKU tidak dapat diubah setelah produk dibuat.
                </FormDescription>
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
              <FormLabel>
                Deskripsi <span className="text-destructive">*</span>
              </FormLabel>
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
                Minimal 30 karakter. Format markdown didukung.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {mode === "bundle" && (
        <div className="mt-6 border-t pt-5">
          <FormField
            control={control}
            name="bundleComponents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Komposisi Bundle <span className="text-destructive">*</span>
                </FormLabel>
                <FormDescription>
                  Pilih produk komponen beserta jumlahnya. Bundle dijual sebagai
                  1 SKU; stoknya dihitung otomatis dari komponen.
                </FormDescription>
                <FormControl>
                  <BundleBuilder
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </FormSectionCard>
  );
}
