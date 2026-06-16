"use client"

import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { FormSectionCard } from "@/components/ui/form-section-card"
import { useCategoryFormAttributes } from "@/hooks/master-produk/use-master-data"
import type { BuatProdukFormValues } from "@/types/master-produk"

/**
 * Spesifikasi dinamis: field menyesuaikan kategori Level-2 yang dipilih
 * (dari GET /categories/{id}/form-attributes). Hanya tampil bila kategori
 * punya atribut spesifikasi.
 */
export function FormSpecificationSection() {
  const { watch, setValue } = useFormContext<BuatProdukFormValues>()
  const category = watch("category")
  const specs = watch("specifications")
  const { data } = useCategoryFormAttributes(category?.id)
  const specAttrs = data?.specifications ?? []

  if (!category || specAttrs.length === 0) return null

  const valueOf = (id: number) => specs.find((s) => s.attributeId === id)?.value ?? ""

  const setSpec = (id: number, value: string) => {
    const next = specs.filter((s) => s.attributeId !== id)
    if (value.trim()) next.push({ attributeId: id, value })
    setValue("specifications", next, { shouldDirty: true })
  }

  return (
    <FormSectionCard id="spesifikasi" title="Spesifikasi">
      <p className="mb-4 text-sm text-muted-foreground">
        Atribut menyesuaikan kategori. Bantu pembeli memilih produk yang tepat.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {specAttrs.map((a) => {
          const requiredFor = Object.entries(a.channels)
            .filter(([, s]) => s.required)
            .map(([code]) => code)

          return (
            <div key={a.attribute_id} className="space-y-1.5">
              <label className="text-sm font-medium">
                {a.name}
                {a.is_required && <span className="text-destructive"> *</span>}
              </label>
              {a.options.length > 0 ? (
                <Combobox
                  options={a.options.map((o) => ({ value: o.value, label: o.value }))}
                  value={valueOf(a.attribute_id) || null}
                  onChange={(v) => setSpec(a.attribute_id, v ?? "")}
                  placeholder={`Pilih ${a.name}`}
                />
              ) : (
                <Input
                  value={valueOf(a.attribute_id)}
                  onChange={(e) => setSpec(a.attribute_id, e.target.value)}
                  placeholder={`Masukkan ${a.name.toLowerCase()}`}
                />
              )}
              {requiredFor.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Wajib untuk: {requiredFor.join(", ")}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </FormSectionCard>
  )
}
