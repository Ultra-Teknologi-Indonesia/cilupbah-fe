"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, LockIcon } from "lucide-react"
import { toast } from "sonner"

import { PageTitle } from "@/components/dashboard/page-title"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import {
  locationFormSchema,
  type LocationFormValues,
} from "@/lib/pengaturan/location-schema"
import { useLocationDetail } from "@/hooks/pengaturan/use-location-detail"
import { useCreateLocation } from "@/hooks/pengaturan/use-create-location"
import { useUpdateLocation } from "@/hooks/pengaturan/use-update-location"
import { useGenerateBins } from "@/hooks/pengaturan/use-generate-bins"
import { useWarehouseLayoutSetting } from "@/hooks/pengaturan/use-warehouse-layout-setting"
import type {
  BinPreviewItem,
  GenerateBinsPayload,
  Location,
  LocationPayload,
} from "@/types/pengaturan/location"

import { InformasiTab } from "./informasi-tab"
import { LayoutGudangTab } from "./layout-gudang-tab"

const LIST_HREF = "/dashboard/manajemen-rak/lokasi"

type Section = "informasi" | "layout"

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg) return msg
  }
  return fallback
}

const createDefaults: LocationFormValues = {
  locationName: "",
  locationCode: "",
  address: "",
  coordinate: "",
  provinceId: "",
  cityId: "",
  districtId: "",
  villageId: "",
  postCode: "",
  phone: "",
  email: "",
  defaultWarehouseUser: "",
  isWarehouse: true,
  isActive: true,
  isPos: false,
}

function toFormValues(loc: Location): LocationFormValues {
  return {
    locationName: loc.locationName,
    locationCode: loc.locationCode,
    address: loc.address ?? "",
    coordinate: loc.coordinate ?? "",
    provinceId: loc.village?.district?.city?.province?.id ?? "",
    cityId: loc.village?.district?.city?.id ?? "",
    districtId: loc.village?.district?.id ?? "",
    villageId: loc.villageId ?? "",
    postCode: loc.postCode ?? "",
    phone: loc.phone ?? "",
    email: loc.email ?? "",
    defaultWarehouseUser: loc.defaultWarehouseUser ?? "",
    isWarehouse: loc.isWarehouse,
    isActive: loc.isActive,
    isPos: loc.isPos,
  }
}

function buildPayload(values: LocationFormValues): LocationPayload {
  return {
    location_code: values.locationCode,
    location_name: values.locationName,
    address: values.address,
    village_id: values.villageId || null,
    post_code: values.postCode,
    phone: values.phone,
    email: values.email,
    coordinate: values.coordinate || null,
    default_warehouse_user: values.defaultWarehouseUser || null,
    is_warehouse: values.isWarehouse,
    is_active: values.isActive,
    is_pos: values.isPos,
  }
}

interface LocationFormPageProps {
  mode: "create" | "edit"
  id?: string
}

export function LocationFormPage({ mode, id }: LocationFormPageProps) {
  const router = useRouter()
  const [section, setSection] = React.useState<Section>("informasi")
  const [appliedPayload, setAppliedPayload] =
    React.useState<GenerateBinsPayload | null>(null)

  const detail = useLocationDetail(mode === "edit" ? id : undefined)
  const layoutSetting = useWarehouseLayoutSetting()
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const generateBins = useGenerateBins()

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: createDefaults,
  })

  // Prefill saat edit.
  const prefilledRef = React.useRef(false)
  React.useEffect(() => {
    if (mode === "edit" && detail.data && !prefilledRef.current) {
      form.reset(toFormValues(detail.data))
      prefilledRef.current = true
    }
  }, [mode, detail.data, form])

  const locked = mode === "edit" && Boolean(detail.data?.isLocked)
  const layoutEnabled = layoutSetting.data?.useWarehouseLayout ?? false
  const saving =
    createLocation.isPending || updateLocation.isPending || generateBins.isPending

  const initialBins: BinPreviewItem[] = React.useMemo(
    () =>
      (detail.data?.bins ?? [])
        .filter((b) => !b.isInbound && b.binFinalCode !== "DEFAULT")
        .map((b) => ({
          floorCode: b.floorCode ?? "",
          rowCode: b.rowCode ?? "",
          columnCode: b.columnCode ?? "",
          binCode: b.binCode ?? "",
          binFinalCode: b.binFinalCode,
          maxQty: b.maxQty,
        })),
    [detail.data]
  )

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildPayload(values)
      let locationId = id

      if (mode === "create") {
        const created = await createLocation.mutateAsync(payload)
        locationId = created.id
      } else if (id) {
        await updateLocation.mutateAsync({ id, payload })
      }

      if (layoutEnabled && appliedPayload && locationId) {
        await generateBins.mutateAsync({ locationId, payload: appliedPayload })
      }

      toast.success(
        mode === "create" ? "Lokasi berhasil dibuat." : "Lokasi berhasil diperbarui."
      )
      router.push(LIST_HREF)
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan lokasi."))
    }
  })

  const title = mode === "create" ? "Tambah Lokasi" : "Edit Lokasi"

  if (mode === "edit" && detail.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Memuat lokasi…
      </div>
    )
  }

  if (mode === "edit" && detail.isError) {
    return (
      <div className="py-24 text-center text-sm text-destructive">
        Gagal memuat lokasi.
      </div>
    )
  }

  const navItems: { key: Section; label: string; show: boolean }[] = [
    { key: "informasi", label: "Informasi Lokasi", show: true },
    { key: "layout", label: "Layout Gudang", show: layoutEnabled },
  ]

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <PageTitle
          title={title}
          breadcrumb={[
            { label: "Gudang" },
            { label: "Manajemen Rak & Lokasi" },
            { label: "Lokasi Gudang", href: LIST_HREF },
            { label: title },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={LIST_HREF}>Batal</Link>
              </Button>
              {!locked && (
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving && <Loader2Icon className="animate-spin" />}
                  Simpan
                </Button>
              )}
            </div>
          }
        />

        {locked && (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <LockIcon className="size-4" />
            Lokasi sistem ini terkunci dan tidak dapat diubah.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sub-nav kiri */}
          <nav className="flex flex-col gap-2">
            {navItems
              .filter((n) => n.show)
              .map((n) => (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setSection(n.key)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    section === n.key
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {n.label}
                </button>
              ))}
          </nav>

          {/* Konten */}
          <div className="rounded-2xl border border-border bg-card p-6">
            {section === "informasi" ? (
              <InformasiTab disabled={locked} />
            ) : (
              <LayoutGudangTab
                disabled={locked}
                initialBins={initialBins}
                onApply={setAppliedPayload}
              />
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
