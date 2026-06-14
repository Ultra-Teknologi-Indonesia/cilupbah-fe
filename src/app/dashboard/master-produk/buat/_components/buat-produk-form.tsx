"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import { PageTitle } from "@/components/dashboard/page-title"

import { SectionNav, type SectionStatus } from "./section-nav"
import { CategoryPicker, type SelectedCategory } from "./category-picker"
import { ShopMultiSelect } from "./shop-multiselect"
import { MediaUploader } from "./media-uploader"
import {
  defaultAccounts,
  mockBrands,
  mockCogsAccounts,
  mockInventoryAccounts,
  mockSalesAccounts,
  mockSalesReturnAccounts,
  mockShops,
  mockTaxes,
  TAX_RATE,
} from "../_data/mock-form-options"

const schema = z
  .object({
    name: z.string().trim().min(1, "Nama produk wajib diisi").max(255),
    sku: z.string().trim().min(1, "SKU wajib diisi").max(50),
    category: z
      .object({ id: z.string(), name: z.string(), path: z.array(z.string()) })
      .nullable(),
    brandId: z.string().nullable(),
    brandOther: z.string().max(255).optional(),
    description: z.string().max(10000).optional(),
    isBundle: z.boolean(),
    isConsignment: z.boolean(),
    isPreorder: z.boolean(),
    indentDays: z.string().optional(),
    isStored: z.boolean(),
    isSold: z.boolean(),
    isPurchased: z.boolean(),
    sellPrice: z.string().optional(),
    salesTaxId: z.string().nullable(),
    salesAccountId: z.string().nullable(),
    salesReturnAccountId: z.string().nullable(),
    buyPrice: z.string().optional(),
    purchaseTaxId: z.string().nullable(),
    inventoryAccountId: z.string().nullable(),
    cogsAccountId: z.string().nullable(),
    purchaseLeadTime: z.string().optional(),
    minStock: z.string().optional(),
    safeStock: z.string().optional(),
    unlimitedShopIds: z.array(z.string()),
    weight: z.string().min(1, "Berat wajib diisi"),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    packageContents: z.string().max(2000).optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.category)
      ctx.addIssue({ path: ["category"], code: "custom", message: "Kategori wajib dipilih" })
    if (v.isSold && !v.sellPrice?.trim())
      ctx.addIssue({ path: ["sellPrice"], code: "custom", message: "Harga jual wajib diisi" })
    if (v.isPreorder && !v.indentDays?.trim())
      ctx.addIssue({ path: ["indentDays"], code: "custom", message: "Lama indent wajib diisi" })
    if (v.description && v.description.length > 0 && v.description.length < 30)
      ctx.addIssue({ path: ["description"], code: "custom", message: "Minimal 30 karakter" })
    const min = Number(v.minStock || 0)
    const safe = Number(v.safeStock || 0)
    if (v.safeStock?.trim() && safe < min)
      ctx.addIssue({ path: ["safeStock"], code: "custom", message: "Tidak boleh < batas stok menipis" })
  })

type FormValues = z.input<typeof schema>

function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function MoneyInput({ id, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        Rp
      </span>
      <Input id={id} inputMode="numeric" className="pl-9" {...props} />
    </div>
  )
}

function Section({
  id,
  title,
  action,
  children,
}: {
  id: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <Card className="gap-0 py-0 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-base">{title}</CardTitle>
          {action}
        </CardHeader>
        <CardContent className="py-5">{children}</CardContent>
      </Card>
    </section>
  )
}

export function BuatProdukForm() {
  const router = useRouter()
  const [imageCount, setImageCount] = React.useState(0)
  const modeRef = React.useRef<"download" | "in_review">("in_review")

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      sku: "",
      category: null,
      brandId: null,
      brandOther: "",
      description: "",
      isBundle: false,
      isConsignment: false,
      isPreorder: false,
      indentDays: "",
      isStored: true,
      isSold: true,
      isPurchased: true,
      sellPrice: "",
      salesTaxId: null,
      salesAccountId: null,
      salesReturnAccountId: null,
      buyPrice: "",
      purchaseTaxId: null,
      inventoryAccountId: null,
      cogsAccountId: null,
      purchaseLeadTime: "",
      minStock: "",
      safeStock: "",
      unlimitedShopIds: [],
      weight: "",
      length: "",
      width: "",
      height: "",
      packageContents: "",
    },
  })

  const v = watch()

  const onValid = (data: FormValues) => {
    toast.success(
      modeRef.current === "download"
        ? "Draf produk disimpan (mock)"
        : "Produk diajukan untuk review (mock)",
      { description: `${data.name} · ${data.sku}` }
    )
    // Phase 1: belum integrasi BE — kembali ke daftar produk.
    router.push("/dashboard/master-produk")
  }

  const onInvalid = () => {
    const order = ["detail", "penjualan", "pengiriman", "media"] as const
    const first = order.find((id) => sectionHasError(id))
    if (first)
      document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "start" })
    toast.error("Beberapa isian perlu diperbaiki")
  }

  const submit = (mode: "download" | "in_review") => {
    modeRef.current = mode
    handleSubmit(onValid, onInvalid)()
  }

  const has = (...keys: (keyof FormValues)[]) => keys.some((k) => errors[k])
  function sectionHasError(id: string): boolean {
    if (id === "detail") return has("name", "sku", "category", "description", "indentDays")
    if (id === "penjualan") return has("sellPrice", "safeStock")
    if (id === "pengiriman") return has("weight", "length", "width", "height")
    return false
  }
  function sectionStatus(id: string): SectionStatus {
    if (sectionHasError(id)) return "error"
    if (id === "detail") return v.name && v.sku && v.category ? "valid" : "empty"
    if (id === "penjualan") return !v.isSold || v.sellPrice ? "valid" : "empty"
    if (id === "pengiriman") return v.weight ? "valid" : "empty"
    if (id === "media") return imageCount > 0 ? "valid" : "empty"
    return "empty"
  }

  const sections = [
    { id: "detail", label: "Detail Produk", status: sectionStatus("detail") },
    { id: "penjualan", label: "Penjualan & Pembelian", status: sectionStatus("penjualan") },
    { id: "pengiriman", label: "Pengiriman", status: sectionStatus("pengiriman") },
    { id: "media", label: "Gambar & Video", status: sectionStatus("media") },
  ]
  const errorCount = Object.keys(errors).length

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Buat Produk Satuan"
        description="Lengkapi informasi produk. Field bertanda * wajib diisi."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk Master", href: "/dashboard/master-produk" },
          { label: "Buat Produk" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="hidden text-xs text-destructive sm:inline">
                {errorCount} perlu diperbaiki
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => submit("download")}>
              Simpan draf
            </Button>
            <Button size="sm" onClick={() => submit("in_review")}>
              Simpan &amp; Ajukan Review
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-6 gap-0 px-2 py-4 backdrop-blur-xl">
            <SectionNav sections={sections} />
          </Card>
        </aside>

        <form
          className="flex flex-col gap-6 [&_[data-slot=input]]:border-border [&_[data-slot=input]]:bg-background [&_[data-slot=textarea]]:border-border [&_[data-slot=textarea]]:bg-background"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* ── Detail Produk ─────────────────────────────── */}
          <Section id="detail" title="Detail Produk">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nama Produk" required htmlFor="name" error={errors.name?.message}>
                <Input id="name" placeholder="mis. Resistance Band Set Premium" {...register("name")} />
              </Field>
              <Field label="Merek" htmlFor="brandId" hint="Pilih merek atau isi 'Merek lainnya'">
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <Combobox
                      id="brandId"
                      options={mockBrands}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih merek"
                    />
                  )}
                />
              </Field>
              <Field label="Kategori" required error={errors.category?.message as string}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <CategoryPicker
                      value={field.value as SelectedCategory | null}
                      onChange={field.onChange}
                      invalid={!!errors.category}
                    />
                  )}
                />
              </Field>
              <Field label="Merek Lainnya" htmlFor="brandOther" hint="Opsional — buat merek baru">
                <Input id="brandOther" placeholder="Nama merek baru" {...register("brandOther")} />
              </Field>
              <Field label="SKU" required htmlFor="sku" error={errors.sku?.message}>
                <Input id="sku" placeholder="mis. RB-SET-5PCS" maxLength={50} {...register("sku")} />
              </Field>
            </div>

            <div className="mt-5">
              <Field
                label="Deskripsi"
                htmlFor="description"
                error={errors.description?.message}
                hint="Opsional. Jika diisi, minimal 30 karakter."
              >
                <Textarea
                  id="description"
                  rows={4}
                  maxLength={10000}
                  placeholder="Jelaskan keunggulan produk…"
                  {...register("description")}
                />
              </Field>
            </div>

            <div className="mt-6 border-t pt-5">
              <h4 className="mb-3 text-sm font-medium">Tipe Produk</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <ToggleRow control={control} name="isBundle" label="Produk Bundle" />
                <ToggleRow control={control} name="isConsignment" label="Produk Konsinyasi" />
                <ToggleRow control={control} name="isPreorder" label="Pre-Order" />
              </div>
              {v.isPreorder && (
                <div className="mt-4 max-w-xs">
                  <Field label="Lama indent (hari)" required htmlFor="indentDays" error={errors.indentDays?.message}>
                    <Input id="indentDays" type="number" min={0} placeholder="mis. 7" {...register("indentDays")} />
                  </Field>
                </div>
              )}
            </div>
          </Section>

          {/* ── Penjualan & Pembelian ─────────────────────── */}
          <Section id="penjualan" title="Informasi Penjualan & Pembelian">
            <div className="grid gap-5 md:grid-cols-3">
              {/* Disimpan */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
                <SectionToggle control={control} name="isStored" label="Disimpan" sub="Lacak stok (persediaan)" />
                <div className={cn("flex flex-col gap-4", !v.isStored && "pointer-events-none opacity-50")}>
                  <Field label="Batas stok menipis" htmlFor="minStock">
                    <Input id="minStock" type="number" min={0} placeholder="0" {...register("minStock")} />
                  </Field>
                  <Field label="Batas stok aman" htmlFor="safeStock" error={errors.safeStock?.message}>
                    <Input id="safeStock" type="number" min={0} placeholder="0" {...register("safeStock")} />
                  </Field>
                  <Field label="Toko stok tidak terbatas" hint="Boleh lebih dari satu toko">
                    <Controller
                      control={control}
                      name="unlimitedShopIds"
                      render={({ field }) => (
                        <ShopMultiSelect options={mockShops} value={field.value} onChange={field.onChange} />
                      )}
                    />
                  </Field>
                </div>
              </div>

              {/* Dijual */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
                <SectionToggle control={control} name="isSold" label="Dijual" sub="Tampil di penjualan" />
                <div className={cn("flex flex-col gap-4", !v.isSold && "pointer-events-none opacity-50")}>
                  <Field label="Harga jual" required={v.isSold} htmlFor="sellPrice" error={errors.sellPrice?.message}>
                    <MoneyInput id="sellPrice" placeholder="0" {...register("sellPrice")} />
                  </Field>
                  <Field label="Pajak penjualan" hint={taxHint(v.salesTaxId, v.sellPrice)}>
                    <Controller
                      control={control}
                      name="salesTaxId"
                      render={({ field }) => (
                        <Combobox options={mockTaxes} value={field.value} onChange={field.onChange} placeholder="Pilih pajak" />
                      )}
                    />
                  </Field>
                  <Field label="Akun Penjualan" hint={defaultHint(mockSalesAccounts, defaultAccounts.salesAccountId)}>
                    <Controller control={control} name="salesAccountId" render={({ field }) => (
                      <Combobox options={mockSalesAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                    )} />
                  </Field>
                  <Field label="Retur Penjualan" hint={defaultHint(mockSalesReturnAccounts, defaultAccounts.salesReturnAccountId)}>
                    <Controller control={control} name="salesReturnAccountId" render={({ field }) => (
                      <Combobox options={mockSalesReturnAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                    )} />
                  </Field>
                </div>
              </div>

              {/* Dibeli */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4">
                <SectionToggle control={control} name="isPurchased" label="Dibeli" sub="Tampil di pembelian" />
                <div className={cn("flex flex-col gap-4", !v.isPurchased && "pointer-events-none opacity-50")}>
                  <Field label="Harga beli" htmlFor="buyPrice">
                    <MoneyInput id="buyPrice" placeholder="0" {...register("buyPrice")} />
                  </Field>
                  <Field label="Pajak pembelian">
                    <Controller
                      control={control}
                      name="purchaseTaxId"
                      render={({ field }) => (
                        <Combobox options={mockTaxes} value={field.value} onChange={field.onChange} placeholder="Pilih pajak" />
                      )}
                    />
                  </Field>
                  <Field label="Akun Persediaan" hint={defaultHint(mockInventoryAccounts, defaultAccounts.inventoryAccountId)}>
                    <Controller control={control} name="inventoryAccountId" render={({ field }) => (
                      <Combobox options={mockInventoryAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                    )} />
                  </Field>
                  <Field label="Akun HPP" hint={defaultHint(mockCogsAccounts, defaultAccounts.cogsAccountId)}>
                    <Controller control={control} name="cogsAccountId" render={({ field }) => (
                      <Combobox options={mockCogsAccounts} value={field.value} onChange={field.onChange} placeholder="Pakai akun default" />
                    )} />
                  </Field>
                  <Field label="Lama pembelian (hari)" htmlFor="purchaseLeadTime">
                    <Input id="purchaseLeadTime" type="number" min={0} placeholder="0" {...register("purchaseLeadTime")} />
                  </Field>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Pengiriman ────────────────────────────────── */}
          <Section id="pengiriman" title="Informasi Pengiriman">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Berat paket (gram)" required htmlFor="weight" error={errors.weight?.message}>
                <Input id="weight" type="number" min={0} placeholder="0" {...register("weight")} />
              </Field>
              <Field label="Panjang (cm)" htmlFor="length">
                <Input id="length" type="number" min={0} placeholder="0" {...register("length")} />
              </Field>
              <Field label="Lebar (cm)" htmlFor="width">
                <Input id="width" type="number" min={0} placeholder="0" {...register("width")} />
              </Field>
              <Field label="Tinggi (cm)" htmlFor="height">
                <Input id="height" type="number" min={0} placeholder="0" {...register("height")} />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Isi paket" htmlFor="packageContents" hint="Opsional">
                <Textarea id="packageContents" rows={2} placeholder="mis. 5 band + pouch + panduan" {...register("packageContents")} />
              </Field>
            </div>
          </Section>

          {/* ── Gambar & Video ────────────────────────────── */}
          <Section id="media" title="Gambar & Video Produk">
            <MediaUploader onImagesChange={setImageCount} />
          </Section>
        </form>
      </div>
    </div>
  )
}

function taxHint(taxId: string | null, price?: string): string | undefined {
  if (!taxId || taxId === "t0") return undefined
  const rate = TAX_RATE[taxId] ?? 0
  const p = Number(price || 0)
  if (!p) return `Tarif ${rate}%`
  const tax = Math.round((p * rate) / 100)
  return `Tarif ${rate}% → Rp ${tax.toLocaleString("id-ID")}`
}

// Akun dibiarkan kosong; BE memakai akun default organisasi bila tak diisi.
function defaultHint(
  list: { value: string; label: string }[],
  id: string
): string {
  const label = list.find((o) => o.value === id)?.label
  return label ? `Default: ${label}` : "Pakai akun default perusahaan"
}

// Checkbox enable/disable per kelompok (Disimpan / Dijual / Dibeli) — ala Jubelio.
function SectionToggle({
  control,
  name,
  label,
  sub,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"]
  name: keyof FormValues
  label: string
  sub?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex cursor-pointer items-start gap-2.5 border-b border-border/60 pb-3">
          <Checkbox
            checked={!!field.value}
            onCheckedChange={field.onChange}
            className="mt-0.5"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">{label}</span>
            {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          </span>
        </label>
      )}
    />
  )
}

function ToggleRow({
  control,
  name,
  label,
  sub,
}: {
  control: ReturnType<typeof useForm<FormValues>>["control"]
  name: keyof FormValues
  label: string
  sub?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium">{label}</span>
            {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          </span>
          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
        </label>
      )}
    />
  )
}
