"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormSectionCard } from "@/components/ui/form-section-card"
import { useCategoryFormAttributes } from "@/hooks/master-produk/use-master-data"
import type { BuatProdukFormValues } from "@/types/master-produk"


function CreatableCombobox({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[]
  value: string | null
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const isCustom = search.trim() !== "" && !options.some(
    (o) => o.label.toLowerCase() === search.trim().toLowerCase()
  )

  const select = (v: string) => {
    onChange(v)
    setSearch("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder || "Pilih..."}
          </span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari atau ketik custom..."
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ScrollArea className="max-h-48">
          <div className="p-1">
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => select(o.value)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <CheckIcon className={cn("size-4 shrink-0", value === o.value ? "opacity-100" : "opacity-0")} />
                {o.label}
              </button>
            ))}
            {isCustom && (
              <button
                type="button"
                onClick={() => select(search.trim())}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-accent"
              >
                <CheckIcon className="size-4 shrink-0 opacity-0" />
                Gunakan &ldquo;{search.trim()}&rdquo;
              </button>
            )}
            {filtered.length === 0 && !isCustom && (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">Tidak ditemukan</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}


export function FormSpecificationSection() {
  const { watch, setValue } = useFormContext<BuatProdukFormValues>()
  const category = watch("category")
  const specs = watch("specifications")
  const { data, isError } = useCategoryFormAttributes(category?.id)
  const specAttrs = data?.specifications ?? []

  if (!category || isError || specAttrs.length === 0) return null

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
                <CreatableCombobox
                  options={a.options.map((o) => ({ value: o.value, label: o.value }))}
                  value={valueOf(a.attribute_id) || null}
                  onChange={(v) => setSpec(a.attribute_id, v)}
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
