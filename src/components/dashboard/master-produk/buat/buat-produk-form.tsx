"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"
import { buatProdukSchema } from "@/schemas/master-produk"
import type { BuatProdukFormValues } from "@/types/master-produk"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { PageTitle } from "@/components/dashboard/page-title"

import { SectionNav, type SectionStatus } from "./section-nav"
import { MediaUploader } from "./media-uploader"
import { FormDetailSection } from "./form-detail-section"
import { FormSalesSection } from "./form-sales-section"
import { FormShippingSection } from "./form-shipping-section"
import { FormSectionCard } from "@/components/ui/form-section-card"

export function BuatProdukForm() {
  const router = useRouter()
  const [imageCount, setImageCount] = React.useState(0)
  const modeRef = React.useRef<"download" | "in_review">("in_review")

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
    },
  })

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const v = watch()

  const onValid = (data: BuatProdukFormValues) => {
    toast.success(
      modeRef.current === "download"
        ? "Draf produk disimpan (mock)"
        : "Produk diajukan untuk review (mock)",
      { description: `${data.name} · ${data.sku}` }
    )

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
            <Button variant="outline" onClick={() => submit("download")}>
              <SaveIcon />
              Simpan draf
            </Button>
            <Button variant="brand" onClick={() => submit("in_review")}>
              <SendIcon />
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
            <FormSalesSection />
            <FormShippingSection />

            <FormSectionCard id="media" title="Gambar & Video Produk">
              <MediaUploader onImagesChange={setImageCount} />
            </FormSectionCard>
          </form>
        </Form>
      </div>
    </div>
  )
}
