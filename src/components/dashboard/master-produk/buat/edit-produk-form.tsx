"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { buatProdukSchema } from "@/schemas/master-produk"
import type { BuatProdukFormValues, ProductDetail } from "@/types/master-produk"
import { detailToFormValues, detailVariantLocks } from "@/lib/master-produk/detail-to-form"
import { SERVER_FIELD_MAP } from "@/lib/master-produk/server-field-map"
import { useUpdateProduct } from "@/hooks/master-produk/use-update-product"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { PageTitle } from "@/components/dashboard/page-title"

import { SectionNav, type SectionStatus } from "./section-nav"
import { MediaUploader } from "./media-uploader"
import { FormDetailSection } from "./form-detail-section"
import { FormSalesSection } from "./form-sales-section"
import { FormShippingSection } from "./form-shipping-section"
import { FormVariantSection } from "./form-variant-section"
import { FormSectionCard } from "@/components/ui/form-section-card"

export function EditProdukForm({ product }: { product: ProductDetail }) {
  const router = useRouter()
  const [mediaFiles, setMediaFiles] = React.useState<File[]>([])
  const { mutateAsync, isPending } = useUpdateProduct(product.id)

  const isMultiVariant = product.variants.length > 1
  const originalVariantSku = product.variants[0]?.sku
  const detailHref = `/dashboard/master-produk/${product.id}`
  const variantLocks = React.useMemo(() => detailVariantLocks(product), [product])

  const form = useForm<BuatProdukFormValues>({
    resolver: zodResolver(buatProdukSchema),
    mode: "onBlur",
    defaultValues: detailToFormValues(product),
  })

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form
  const v = watch()

  const applyServerErrors = (err: unknown): boolean => {
    const body = err as { errors?: Record<string, string[]> }
    if (!body?.errors || typeof body.errors !== "object") return false
    let firstField: keyof BuatProdukFormValues | undefined
    for (const [key, messages] of Object.entries(body.errors)) {
      const field = SERVER_FIELD_MAP[key]
      if (!field) continue
      form.setError(field, {
        type: "server",
        message: Array.isArray(messages) ? messages[0] : String(messages),
      })
      firstField ??= field
    }
    if (firstField) form.setFocus(firstField)
    return true
  }

  const onValid = async (data: BuatProdukFormValues) => {
    try {
      await mutateAsync({
        values: data,
        files: mediaFiles,
        includeVariant: !isMultiVariant,
        originalVariantSku,
      })
      toast.success("Perubahan produk disimpan")
      router.push(detailHref)
    } catch (err) {
      const body = err as { message?: string }
      if (applyServerErrors(err)) toast.error(body?.message || "Beberapa isian ditolak server")
      else toast.error(body?.message || "Gagal menyimpan perubahan")
    }
  }

  const onInvalid = () => {
    const order = ["detail", "penjualan", "pengiriman", "media"] as const
    const first = order.find((id) => sectionHasError(id))
    if (first) document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "start" })
    toast.error("Beberapa isian perlu diperbaiki")
  }

  const has = (...keys: (keyof BuatProdukFormValues)[]) => keys.some((k) => errors[k])
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
    if (id === "media") return mediaFiles.length > 0 ? "valid" : "empty"
    return "empty"
  }

  const sections = [
    { id: "detail", label: "Detail Produk", status: sectionStatus("detail") },
    { id: "penjualan", label: "Penjualan & Pembelian", status: sectionStatus("penjualan") },
    { id: "pengiriman", label: "Pengiriman", status: sectionStatus("pengiriman") },
    { id: "media", label: "Gambar & Video", status: sectionStatus("media") },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Edit Produk"
        description={product.name}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk Master", href: "/dashboard/master-produk" },
          { label: product.name, href: detailHref },
          { label: "Edit" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild disabled={isPending}>
              <Link href={detailHref}>Batal</Link>
            </Button>
            <Button variant="primary" onClick={() => !isPending && handleSubmit(onValid, onInvalid)()} disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              Simpan perubahan
            </Button>
          </div>
        }
      />

      {product.status === "master" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          Produk berstatus Master — perubahan langsung berlaku di katalog & channel.
        </div>
      )}

      {isMultiVariant && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          Produk ini memiliki {product.variants.length} varian. Bagian Penjualan &amp; Pembelian
          dikunci — edit harga/pajak per varian akan tersedia lewat editor variasi.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-6 gap-0 px-2 py-4 backdrop-blur-xl">
            <SectionNav sections={sections} />
          </Card>
        </aside>

        <Form {...form}>
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <FormDetailSection skuDisabled />

            <FormVariantSection
              lockedTypeIds={variantLocks.lockedTypeIds}
              lockedValues={variantLocks.lockedValues}
            />

            <fieldset
              disabled={isMultiVariant}
              className={cn("m-0 min-w-0 border-0 p-0", isMultiVariant && "opacity-60")}
            >
              <FormSalesSection />
            </fieldset>

            <FormShippingSection />

            <FormSectionCard id="media" title="Gambar & Video Produk">
              {product.primaryImage && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.primaryImage} alt={product.name} className="size-12 rounded-lg object-cover" />
                  <p className="text-xs text-muted-foreground">
                    Gambar saat ini. Mengunggah gambar baru akan{" "}
                    <span className="font-medium">menggantikan semua</span> gambar lama.
                  </p>
                </div>
              )}
              <MediaUploader onChange={setMediaFiles} />
            </FormSectionCard>
          </form>
        </Form>
      </div>
    </div>
  )
}
