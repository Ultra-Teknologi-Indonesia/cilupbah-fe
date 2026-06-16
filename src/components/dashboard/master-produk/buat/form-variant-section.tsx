"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { FormSectionCard } from "@/components/ui/form-section-card"
import { useCategoryFormAttributes } from "@/hooks/master-produk/use-master-data"
import type { BuatProdukFormValues, FormAttribute } from "@/types/master-produk"

type VarOption = { attributeId: number; value: string }

function buildCombos(types: { attributeId: number; values: string[] }[]): VarOption[][] {
  if (types.length === 0) return []
  let acc: VarOption[][] = [[]]
  for (const t of types) {
    if (t.values.length === 0) return []
    acc = acc.flatMap((combo) =>
      t.values.map((v) => [...combo, { attributeId: t.attributeId, value: v }])
    )
  }
  return acc
}

const skuPart = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-")

/** Input penambah opsi nilai untuk satu jenis varian + saran dari atribut channel. */
function OptionAdder({
  suggestions,
  existing,
  onAdd,
}: {
  suggestions: string[]
  existing: string[]
  onAdd: (value: string) => void
}) {
  const [text, setText] = React.useState("")
  const lowerExisting = existing.map((v) => v.toLowerCase())
  const freeSuggestions = suggestions.filter(
    (s) => !lowerExisting.includes(s.toLowerCase())
  )

  const submit = () => {
    onAdd(text)
    setText("")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Masukkan opsi (mis. Merah, 256/8)"
          className="h-9"
        />
        <Button type="button" variant="outline" size="sm" onClick={submit}>
          <PlusIcon /> Tambah
        </Button>
      </div>
      {freeSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {freeSuggestions.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onAdd(s)}
              className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted/60"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Builder varian: pilih ≤2 jenis varian (dari atribut kategori), tambah opsi nilai
 * (custom string didukung), lalu kombinasi (cartesian) tampil sebagai tabel untuk diisi
 * SKU & harga. Saat edit: jenis/opsi yang sudah tersimpan tak boleh dihapus (lockedTypeIds/
 * lockedValues), hanya boleh menambah.
 */
export function FormVariantSection({
  lockedTypeIds = [],
  lockedValues = {},
}: {
  lockedTypeIds?: number[]
  lockedValues?: Record<number, string[]>
} = {}) {
  const { watch, setValue, getValues } = useFormContext<BuatProdukFormValues>()
  const category = watch("category")
  const baseSku = watch("sku")
  const variationTypes = watch("variationTypes")
  const variants = watch("variants")

  const { data } = useCategoryFormAttributes(category?.id)
  const availableTypes: FormAttribute[] = data?.variant_types ?? []

  const usedAttrIds = variationTypes.map((t) => t.attributeId)
  const selectableTypes = availableTypes.filter(
    (t) => !usedAttrIds.includes(t.attribute_id)
  )

  const typesKey = JSON.stringify(variationTypes)
  React.useEffect(() => {
    const combos = buildCombos(variationTypes)
    const prevByKey = new Map(getValues("variants").map((v) => [v.key, v]))
    const next = combos.map((opts) => {
      const key = opts.map((o) => `${o.attributeId}:${o.value}`).join("|")
      const label = opts.map((o) => o.value).join(" / ")
      const suggest = [baseSku, ...opts.map((o) => skuPart(o.value))]
        .filter(Boolean)
        .join("-")
        .toUpperCase()
      const prev = prevByKey.get(key)
      return {
        key,
        label,
        options: opts,
        sku: prev?.sku || suggest,
        sellPrice: prev?.sellPrice ?? "",
      }
    })
    setValue("variants", next, { shouldDirty: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesKey, baseSku])

  if (!category) return null
  if (availableTypes.length === 0) return null

  const setTypes = (next: BuatProdukFormValues["variationTypes"]) =>
    setValue("variationTypes", next, { shouldDirty: true })

  const addType = (attr: FormAttribute) => {
    if (variationTypes.length >= 2) return
    setTypes([
      ...variationTypes,
      { attributeId: attr.attribute_id, name: attr.name, values: [] },
    ])
  }
  const removeType = (idx: number) =>
    setTypes(variationTypes.filter((_, i) => i !== idx))

  const addValue = (idx: number, value: string) => {
    const v = value.trim()
    if (!v) return
    const t = variationTypes[idx]
    if (t.values.some((x) => x.toLowerCase() === v.toLowerCase())) return
    setTypes(
      variationTypes.map((tt, i) =>
        i === idx ? { ...tt, values: [...tt.values, v] } : tt
      )
    )
  }
  const removeValue = (idx: number, vi: number) =>
    setTypes(
      variationTypes.map((tt, i) =>
        i === idx ? { ...tt, values: tt.values.filter((_, j) => j !== vi) } : tt
      )
    )

  const updateVariant = (i: number, patch: Partial<BuatProdukFormValues["variants"][number]>) => {
    const cur = getValues("variants")
    setValue(
      "variants",
      cur.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
      { shouldDirty: true }
    )
  }

  const isLockedValue = (attrId: number, value: string) =>
    (lockedValues[attrId] ?? []).some((v) => v.toLowerCase() === value.toLowerCase())

  return (
    <FormSectionCard id="varian" title="Varian Produk">
      <p className="mb-4 text-sm text-muted-foreground">
        Opsional. Tambahkan maksimal 2 jenis varian (mis. Warna, Ukuran). Kosongkan untuk produk satuan.
      </p>

      <div className="space-y-4">
        {variationTypes.map((t, idx) => {
          const attr = availableTypes.find((a) => a.attribute_id === t.attributeId)
          const locked = lockedTypeIds.includes(t.attributeId)
          return (
            <div key={t.attributeId} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">{t.name}</span>
                {!locked && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeType(idx)}
                  >
                    <Trash2Icon /> Hapus jenis
                  </Button>
                )}
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {t.values.length === 0 && (
                  <span className="text-xs text-muted-foreground">Belum ada opsi</span>
                )}
                {t.values.map((val, vi) => {
                  const valLocked = locked || isLockedValue(t.attributeId, val)
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                    >
                      {val}
                      {!valLocked && (
                        <button
                          type="button"
                          onClick={() => removeValue(idx, vi)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Hapus ${val}`}
                        >
                          <XIcon className="size-3" />
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>

              <OptionAdder
                suggestions={(attr?.options ?? []).map((o) => o.value)}
                existing={t.values}
                onAdd={(v) => addValue(idx, v)}
              />
            </div>
          )
        })}

        {variationTypes.length < 2 && selectableTypes.length > 0 && (
          <div className="max-w-xs">
            <Combobox
              options={selectableTypes.map((t) => ({
                value: String(t.attribute_id),
                label: t.name,
              }))}
              value={null}
              onChange={(v) => {
                const t = selectableTypes.find((x) => String(x.attribute_id) === v)
                if (t) addType(t)
              }}
              placeholder="+ Tambah jenis varian"
            />
          </div>
        )}
      </div>

      {variants.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Kombinasi</th>
                <th className="px-3 py-2 font-medium">SKU <span className="text-destructive">*</span></th>
                <th className="px-3 py-2 font-medium">Harga jual</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((row, i) => (
                <tr key={row.key} className="border-t">
                  <td className="px-3 py-2 font-medium">{row.label}</td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.sellPrice ?? ""}
                      onChange={(e) => updateVariant(i, { sellPrice: e.target.value })}
                      placeholder="Harga"
                      className="h-9 max-w-40"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FormSectionCard>
  )
}
