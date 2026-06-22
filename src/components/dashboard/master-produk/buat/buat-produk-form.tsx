"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangleIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { buatProdukSchema } from "@/schemas/master-produk"
import type { BuatProdukFormValues } from "@/types/master-produk"
import { useCreateProduct } from "@/hooks/master-produk/use-create-product"
import { SERVER_FIELD_MAP } from "@/lib/master-produk/server-field-map"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  const modeRef = React.useRef<"master">("master")
  const [serverErrors, setServerErrors] = React.useState<string[]>([])
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const { mutateAsync, isPending } = useCreateProduct()

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
    const serverErrs = body?.errors
    if (!serverErrs || typeof serverErrs !== "object") return false

    const allMessages: string[] = []
    let firstField: keyof BuatProdukFormValues | undefined
    for (const [key, messages] of Object.entries(serverErrs)) {
      const msg = Array.isArray(messages) ? messages[0] : String(messages)
      allMessages.push(msg)
      const field = SERVER_FIELD_MAP[key]
      if (!field) continue
      form.setError(field, { type: "server", message: msg })
      firstField ??= field
    }
    setServerErrors(allMessages)
    if (firstField) form.setFocus(firstField)
    window.scrollTo({ top: 0, behavior: "smooth" })
    return true
  }

  const onValid = async (data: BuatProdukFormValues) => {
    setServerErrors([])
    try {
      await mutateAsync({ values: data, files: mediaFiles, status: modeRef.current })
      toast.success("Produk berhasil dibuat", {
        description: `${data.name} · ${data.sku}`,
      })
      router.push("/dashboard/produk")
    } catch (err) {
      const body = err as { message?: string }
      if (applyServerErrors(err)) {
        toast.error(body?.message || "Beberapa isian ditolak server")
      } else {
        setServerErrors([body?.message || "Gagal menyimpan produk"])
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

  const busy = isPending

  const submit = (mode: "master") => {
    if (busy) return
    modeRef.current = mode

    const missingMedia = !hasImage
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
        backHref="/dashboard/produk"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk Master", href: "/dashboard/produk" },
          { label: "Buat Produk" },
        ]}
      />

      {serverErrors.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-destructive">
              Gagal menyimpan produk — perbaiki kesalahan berikut:
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-destructive/90">
              {serverErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setServerErrors([])}
            className="shrink-0 text-destructive/60 hover:text-destructive"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

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

            <div className="flex items-center justify-end gap-3">
              {errorCount > 0 && (
                <span className="text-xs text-destructive">
                  {errorCount} perlu diperbaiki
                </span>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCancelOpen(true)}
                disabled={busy}
              >
                <XIcon />
                Batalkan
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => submit("master")}
                disabled={busy}
              >
                {busy && modeRef.current === "master" ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SendIcon />
                )}
                Simpan Produk
              </Button>
            </div>

            <ConfirmDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              title="Batalkan perubahan?"
              description="Data yang belum disimpan akan hilang."
              confirmLabel="Ya, batalkan"
              variant="destructive"
              onConfirm={() => router.push("/dashboard/produk")}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
