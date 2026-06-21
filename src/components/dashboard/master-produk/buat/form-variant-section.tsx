"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { ImageIcon, InfoIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { FormSectionCard } from "@/components/ui/form-section-card"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useCategoryFormAttributes } from "@/hooks/master-produk/use-master-data"
import { buildCombos, comboKey, comboLabel, skuPart } from "@/lib/master-produk/variant-combos"
import type { BuatProdukFormValues, FormAttribute } from "@/types/master-produk"

function useObjectUrl(file: File | undefined) {
  const [url, setUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!(file instanceof File)) { setUrl(null); return }
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return url
}

function VariantImageCell({
  image,
  imageFile,
  onChange,
}: {
  image: string | null | undefined
  imageFile: File | undefined
  onChange: (file: File) => void
}) {
  const previewUrl = useObjectUrl(imageFile)
  const src = previewUrl ?? image ?? null

  return (
    <label className="group relative flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border transition-colors hover:border-primary/50 hover:bg-muted/40">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <ImageIcon className="size-4 text-muted-foreground" />
      )}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
          e.target.value = ""
        }}
      />
    </label>
  )
}


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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={submit}
          disabled={!text.trim()}
        >
          <PlusIcon /> Tambah
        </Button>
      </div>

      {freeSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {freeSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onAdd(s)}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs transition-colors hover:bg-muted"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


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
  const weightUnit = watch("weightUnit") === "gram" ? "gr" : "kg"

  const { data, isError } = useCategoryFormAttributes(category?.id)
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
      const key = comboKey(opts)
      const label = comboLabel(opts)
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
        barcode: prev?.barcode ?? "",
        image: prev?.image ?? null,
        imageFile: prev?.imageFile ?? undefined,
        sellPrice: prev?.sellPrice ?? "",
        buyPrice: prev?.buyPrice ?? "",
        weight: prev?.weight ?? "",
        length: prev?.length ?? "",
        width: prev?.width ?? "",
        height: prev?.height ?? "",
      }
    })
    setValue("variants", next, { shouldDirty: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesKey, baseSku])

  if (!category) return null

  if (isError) {
    return (
      <FormSectionCard id="varian" title="Varian Produk">
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            Pilih kategori sampai level terdalam (Kategori &rsaquo; Sub-Kategori &rsaquo; Jenis Produk) untuk mengatur varian.
          </p>
        </div>
      </FormSectionCard>
    )
  }

  const setTypes = (next: BuatProdukFormValues["variationTypes"]) =>
    setValue("variationTypes", next, { shouldDirty: true })

  const addType = (attr: FormAttribute) => {
    if (variationTypes.length >= 2) return
    setTypes([
      ...variationTypes,
      { attributeId: attr.attribute_id, name: attr.name, values: [] },
    ])
  }

  const addCustomType = (name: string) => {
    if (!name || variationTypes.length >= 2) return
    if (variationTypes.some((t) => t.name.toLowerCase() === name.toLowerCase())) return
    setTypes([
      ...variationTypes,
      { attributeId: -Date.now(), name, values: [] },
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
                {locked ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled
                        className="opacity-40"
                      >
                        <Trash2Icon /> Hapus jenis
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Jenis varian yang sudah digunakan tidak dapat dihapus</TooltipContent>
                  </Tooltip>
                ) : (
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
                      {valLocked ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-not-allowed text-muted-foreground/40" aria-label={`${val} terkunci`}>
                              <XIcon className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Opsi varian yang sudah digunakan tidak dapat dihapus</TooltipContent>
                        </Tooltip>
                      ) : (
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

        {variationTypes.length < 2 && (
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
              searchPlaceholder="Cari atau ketik jenis varian baru..."
              onCreateOption={addCustomType}
              createLabel={(q) => `Buat jenis varian "${q}"`}
            />
          </div>
        )}
      </div>

      {variants.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 font-medium">Variasi</th>
                <th className="px-3 py-2 font-medium">Foto</th>
                <th className="px-3 py-2 font-medium">SKU <span className="text-destructive">*</span></th>
                <th className="px-3 py-2 font-medium">Harga Jual</th>
                <th className="px-3 py-2 font-medium">Harga Beli</th>
                <th className="px-3 py-2 font-medium">Berat ({weightUnit})</th>
                <th className="px-3 py-2 font-medium" colSpan={3}>Dimensi P×L×T (cm)</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((row, i) => (
                <tr key={row.key} className="border-t">
                  <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium whitespace-nowrap">{row.label}</td>
                  <td className="px-2 py-2">
                    <VariantImageCell
                      image={row.image}
                      imageFile={row.imageFile instanceof File ? row.imageFile : undefined}
                      onChange={(file) => updateVariant(i, { imageFile: file })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      value={row.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      className="h-9 min-w-28"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.sellPrice ?? ""}
                      onChange={(e) => updateVariant(i, { sellPrice: e.target.value })}
                      placeholder="0"
                      className="h-9 min-w-24"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.buyPrice ?? ""}
                      onChange={(e) => updateVariant(i, { buyPrice: e.target.value })}
                      placeholder="0"
                      className="h-9 min-w-24"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.weight ?? ""}
                      onChange={(e) => updateVariant(i, { weight: e.target.value })}
                      placeholder="0"
                      className="h-9 w-24"
                    />
                  </td>
                  <td className="pl-2 pr-1 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.length ?? ""}
                      onChange={(e) => updateVariant(i, { length: e.target.value })}
                      placeholder="P"
                      className="h-9 w-20"
                    />
                  </td>
                  <td className="px-1 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.width ?? ""}
                      onChange={(e) => updateVariant(i, { width: e.target.value })}
                      placeholder="L"
                      className="h-9 w-20"
                    />
                  </td>
                  <td className="pl-1 pr-2 py-2">
                    <Input
                      type="number"
                      min={0}
                      value={row.height ?? ""}
                      onChange={(e) => updateVariant(i, { height: e.target.value })}
                      placeholder="T"
                      className="h-9 w-20"
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
