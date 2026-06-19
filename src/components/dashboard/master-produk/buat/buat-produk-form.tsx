"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, Loader2Icon, SaveIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"
import { buatProdukSchema } from "@/schemas/master-produk"
import type { BuatProdukFormValues } from "@/types/master-produk"
import { useCreateProduct } from "@/hooks/master-produk/use-create-product"
import { useCreateBundle } from "@/hooks/master-produk/use-create-bundle"
import { SERVER_FIELD_MAP } from "@/lib/master-produk/server-field-map"

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
import { FormSpecificationSection } from "./form-specification-section"
import { FormSectionCard } from "@/components/ui/form-section-card"

export function BuatProdukForm() {
  const router = useRouter()
  const [mediaFiles, setMediaFilesRaw] = React.useState<File[]>([])
  const [mediaError, setMediaError] = React.useState(false)
  const hasImage = mediaFiles.some((f) => f.type.startsWith("image/"))
  const setMediaFiles = React.useCallback((files: File[]) => {
    setMediaFilesRaw(files)
    if (files.some((f) => f.type.startsWith("image/"))) setMediaError(false)
  }, [])
  const modeRef = React.useRef<"download" | "in_review">("in_review")
  const { mutateAsync, isPending } = useCreateProduct()
  const { mutateAsync: createBundle, isPending: isBundlePending } = useCreateBundle()

  const form = useForm<BuatProdukFormValues>({
    resolver: zodResolver(buatProdukSchema),
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
      variationTypes: [],
      variants: [],
      specifications: [],
      bundleComponents: [],
    },
  })

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const v = watch()

  const applyServerErrors = (err: unknown): boolean => {
    const body = err as { message?: string; errors?: Record<string, string[]> }
    const errors = body?.errors
    if (!errors || typeof errors !== "object") return false

    let firstField: keyof BuatProdukFormValues | undefined
    for (const [key, messages] of Object.entries(errors)) {
      const field = SERVER_FIELD_MAP[key]
      if (!field) continue
      const message = Array.isArray(messages) ? messages[0] : String(messages)
      form.setError(field, { type: "server", message })
      firstField ??= field
    }
    if (firstField) form.setFocus(firstField)
    return true
  }

  const onValid = async (data: BuatProdukFormValues) => {
    try {
      if (data.isBundle) {
        
        await createBundle({
          name: data.name,
          sku: data.sku?.trim() || null,
          category_id: Number(data.category!.id),
          brand_id: data.brandId ? Number(data.brandId) : null,
          components: (data.bundleComponents ?? []).map((c) => ({
            variant_id: c.variantId,
            qty: c.qty,
          })),
        })
        toast.success("Bundle produk dibuat", { description: `${data.name} · ${data.sku}` })
        router.push("/dashboard/master-produk")
        return
      }

      await mutateAsync({ values: data, files: mediaFiles, status: modeRef.current })
      toast.success(
        modeRef.current === "download"
          ? "Draf produk disimpan"
          : "Produk diajukan untuk review",
        { description: `${data.name} · ${data.sku}` }
      )
      router.push("/dashboard/master-produk")
    } catch (err) {
      const body = err as { message?: string }
      if (applyServerErrors(err)) {
        toast.error(body?.message || "Beberapa isian ditolak server")
      } else {
        toast.error(body?.message || "Gagal menyimpan produk")
      }
    }
  }

  const onInvalid = () => {
    const order = ["detail", "penjualan", "pengiriman", "media"] as const
    const first = order.find((id) => sectionHasError(id))
    if (first)
      document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "start" })
    toast.error("Beberapa isian perlu diperbaiki")
  }

  const busy = isPending || isBundlePending

  const submit = (mode: "download" | "in_review") => {
    if (busy) return
    modeRef.current = mode

    const missingMedia = !form.getValues("isBundle") && !hasImage
    if (missingMedia) setMediaError(true)

    handleSubmit(
      (data) => {
        if (missingMedia) {
          toast.error("Minimal 1 foto produk wajib diunggah")
          document.getElementById("media")?.scrollIntoView({ behavior: "smooth", block: "start" })
          return
        }
        onValid(data)
      },
      () => {
        if (missingMedia) setMediaError(true)
        onInvalid()
      },
    )()
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
    if (id === "media") return mediaError ? "error" : hasImage ? "valid" : "empty"
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
            <Button variant="outline" asChild>
              <Link href="/dashboard/master-produk" prefetch={false}>
                <ArrowLeftIcon /> Kembali
              </Link>
            </Button>
            {errorCount > 0 && (
              <span className="hidden text-xs text-destructive sm:inline">
                {errorCount} perlu diperbaiki
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => submit("download")}
              disabled={busy}
            >
              {busy && modeRef.current === "download" ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SaveIcon />
              )}
              Simpan draf
            </Button>
            <Button
              variant="primary"
              onClick={() => submit("in_review")}
              disabled={busy}
            >
              {busy && modeRef.current === "in_review" ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
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

        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <FormDetailSection />
            <FormVariantSection />
            <FormSpecificationSection />
            <FormSalesSection />
            <FormShippingSection />

            <FormSectionCard id="media" title={<>Gambar & Video Produk <span className="text-destructive">*</span></>}>
              <MediaUploader onChange={setMediaFiles} />
              <p className="mt-1 text-xs text-muted-foreground">
                Minimal 1 foto produk wajib diunggah.
              </p>
              {mediaError && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  Tambahkan minimal 1 foto produk untuk melanjutkan.
                </p>
              )}
            </FormSectionCard>
          </form>
        </Form>
      </div>
    </div>
  )
}
