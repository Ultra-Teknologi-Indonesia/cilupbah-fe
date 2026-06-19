"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, SaveIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { buatBundleSchema } from "@/schemas/master-produk"
import type { BuatBundleFormValues } from "@/types/master-produk"
import { useCreateBundle } from "@/hooks/master-produk/use-create-bundle"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import { FormDetailSection } from "./form-detail-section"

export function BuatBundleForm() {
  const router = useRouter()
  const { mutateAsync: createBundle, isPending } = useCreateBundle()

  const form = useForm<BuatBundleFormValues>({
    resolver: zodResolver(buatBundleSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      sku: "",
      category: null,
      brandId: null,
      brandOther: "",
      description: "",
      bundleComponents: [],
    },
  })

  const { handleSubmit, formState: { errors } } = form

  const onValid = async (data: BuatBundleFormValues) => {
    try {
      await createBundle({
        name: data.name,
        sku: data.sku?.trim() || null,
        category_id: Number(data.category!.id),
        brand_id: data.brandId ? Number(data.brandId) : null,
        components: data.bundleComponents.map((c) => ({
          variant_id: c.variantId,
          qty: c.qty,
        })),
      })
      toast.success("Bundle produk dibuat", { description: `${data.name} · ${data.sku}` })
      router.push("/dashboard/master-produk")
    } catch (err) {
      const body = err as { message?: string }
      toast.error(body?.message || "Gagal membuat bundle")
    }
  }

  const submit = () => {
    if (isPending) return
    handleSubmit(onValid, () => {
      toast.error("Beberapa isian perlu diperbaiki")
    })()
  }

  const [cancelOpen, setCancelOpen] = React.useState(false)
  const errorCount = Object.keys(errors).length

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Buat Produk Bundle"
        description="Gabungkan beberapa produk menjadi satu SKU bundle."
        backHref="/dashboard/master-produk"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Produk Master", href: "/dashboard/master-produk" },
          { label: "Buat Bundle" },
        ]}
      />

      <div className="mx-auto w-full max-w-2xl">
        <Form {...form}>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <FormDetailSection mode="bundle" />

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
                disabled={isPending}
              >
                <XIcon />
                Batalkan
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={submit}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SaveIcon />
                )}
                Simpan Bundle
              </Button>
            </div>

            <ConfirmDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              title="Batalkan perubahan?"
              description="Data yang belum disimpan akan hilang."
              confirmLabel="Ya, batalkan"
              variant="destructive"
              onConfirm={() => router.push("/dashboard/master-produk")}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
