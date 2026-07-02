"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2Icon, LockIcon } from "lucide-react"
import { toast } from "sonner"

import { PageTitle } from "@/components/dashboard/page-title"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  useContactDetail,
  useContactCategories,
  useAccountPayableOptions,
  useCreateContact,
  useUpdateContact,
} from "@/hooks/kontak-pemasok/use-contacts"
import { useProvinces } from "@/hooks/manajemen-rak/use-regions"
import { LocationMapPicker, formatCoordinate, parseCoordinate } from "@/components/dashboard/manajemen-rak/lokasi/location-map-picker"
import type { ContactFormData, ContactItem } from "@/types/kontak-pemasok/contact"

const LIST_HREF = "/dashboard/kontak-pemasok"

type Section = "umum" | "pic" | "alamat"

const TYPE_OPTIONS = [
  { value: "SUPPLIER", label: "Pemasok" },
  { value: "BOTH", label: "Pemasok dan Pelanggan" },
]

function Req() {
  return <span className="text-destructive"> *</span>
}

function toRegionOptions(items: { id: string; nama: string }[] | undefined) {
  return (items ?? []).map((r) => ({ value: r.id, label: r.nama }))
}

interface KontakFormPageProps {
  mode: "create" | "edit"
  id?: string
}

export function KontakFormPage({ mode, id }: KontakFormPageProps) {
  const router = useRouter()
  const [section, setSection] = React.useState<Section>("umum")

  const detail = useContactDetail(mode === "edit" ? id : undefined)
  const { data: categories = [] } = useContactCategories()
  const { data: accountPayableOptions = [] } = useAccountPayableOptions()
  const provinces = useProvinces()
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()

  const [form, setForm] = React.useState<ContactFormData>({
    name: "",
    type: "SUPPLIER",
    is_company: false,
    shipping_same_as_billing: true,
  })
  const [coordinate, setCoordinate] = React.useState<string>("")

  const prefilledRef = React.useRef(false)
  React.useEffect(() => {
    if (mode === "edit" && detail.data && !prefilledRef.current) {
      const d = detail.data
      setForm({
        name: d.name,
        company_name: d.company_name ?? undefined,
        type: d.type === "CUSTOMER" ? "SUPPLIER" : (d.type as "SUPPLIER" | "BOTH"),
        category_id: d.category?.id ?? undefined,
        account_payable: d.account_payable ?? undefined,
        is_company: d.is_company,
        tax_id: d.tax_id ?? undefined,
        nik: d.nik ?? undefined,
        payment_term: d.payment_term,
        notes: d.notes ?? undefined,
        contact_person: d.contact_person ?? undefined,
        pic_title: d.pic_title ?? undefined,
        phone: d.phone ?? undefined,
        email: d.email ?? undefined,
        fax: d.fax ?? undefined,
        address: d.address ?? undefined,
        province: d.province ?? undefined,
        postal_code: d.postal_code ?? undefined,
        shipping_same_as_billing: d.shipping_same_as_billing ?? true,
        shipping_address: d.shipping_address ?? undefined,
        shipping_province: d.shipping_province ?? undefined,
        shipping_postal_code: d.shipping_postal_code ?? undefined,
        latitude: d.latitude,
        longitude: d.longitude,
      })
      if (d.latitude != null && d.longitude != null) {
        setCoordinate(formatCoordinate(d.latitude, d.longitude))
      }
      prefilledRef.current = true
    }
  }, [mode, detail.data])

  const locked = mode === "edit" && Boolean(detail.data?.is_system)
  const saving = createContact.isPending || updateContact.isPending

  function set<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setSection("umum")
      toast.error("Nama Kontak wajib diisi.")
      return
    }

    const coord = parseCoordinate(coordinate)
    const payload: ContactFormData = {
      ...form,
      latitude: coord?.lat ?? null,
      longitude: coord?.lng ?? null,
    }

    try {
      if (mode === "create") {
        await createContact.mutateAsync(payload)
      } else if (id) {
        await updateContact.mutateAsync({ id, data: payload })
      }
      router.push(LIST_HREF)
    } catch {
      // error handled by hook
    }
  }

  const title = mode === "create" ? "Buat Pemasok" : "Edit Pemasok"

  if (mode === "edit" && detail.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Memuat kontak…
      </div>
    )
  }

  if (mode === "edit" && detail.isError) {
    return (
      <div className="py-24 text-center text-sm text-destructive">
        Gagal memuat kontak.
      </div>
    )
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.code ? `${c.code} - ${c.name}` : c.name,
  }))

  const apOptions = accountPayableOptions.map((o) => ({
    value: o.code,
    label: o.name,
  }))

  const navItems: { key: Section; label: string }[] = [
    { key: "umum", label: "Umum" },
    { key: "pic", label: "PIC" },
    { key: "alamat", label: "Alamat" },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PageTitle
        title={title}
        breadcrumb={[
          { label: "Pembelian" },
          { label: "Kontak Pemasok", href: LIST_HREF },
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
          Kontak sistem ini terkunci dan tidak dapat diubah.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex flex-col gap-2">
          {navItems.map((n) => (
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

        <div className="rounded-2xl border border-border bg-card p-6">
          {section === "umum" && (
            <UmumTab
              form={form}
              set={set}
              disabled={locked}
              categoryOptions={categoryOptions}
              apOptions={apOptions}
            />
          )}
          {section === "pic" && (
            <PICTab form={form} set={set} disabled={locked} />
          )}
          {section === "alamat" && (
            <AlamatTab
              form={form}
              set={set}
              coordinate={coordinate}
              onCoordinateChange={setCoordinate}
              disabled={locked}
              provinceOptions={toRegionOptions(provinces.data)}
              provincesLoading={provinces.isLoading}
            />
          )}
        </div>
      </div>
    </form>
  )
}

// --- Tab: Umum ---
function UmumTab({
  form,
  set,
  disabled,
  categoryOptions,
  apOptions,
}: {
  form: ContactFormData
  set: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void
  disabled: boolean
  categoryOptions: { value: string; label: string }[]
  apOptions: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Nama Kontak<Req /></Label>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Masukkan nama kontak"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipe<Req /></Label>
          <Combobox
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={(v) => set("type", (v as "SUPPLIER" | "BOTH") ?? "SUPPLIER")}
            placeholder="Pilih tipe"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <Combobox
            options={categoryOptions}
            value={form.category_id ?? null}
            onChange={(v) => set("category_id", v ?? undefined)}
            placeholder="Pilih kategori"
            searchPlaceholder="Cari kategori"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Akun Hutang</Label>
        <Combobox
          options={apOptions}
          value={form.account_payable ?? null}
          onChange={(v) => set("account_payable", v ?? undefined)}
          placeholder="Pilih akun"
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is_company"
          checked={form.is_company ?? false}
          onCheckedChange={(v) => set("is_company", v === true)}
          disabled={disabled}
        />
        <Label htmlFor="is_company" className="!mt-0 cursor-pointer">
          Perusahaan
        </Label>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>No. NPWP</Label>
          <Input
            value={form.tax_id ?? ""}
            onChange={(e) => set("tax_id", e.target.value)}
            placeholder="Masukan No. NPWP"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>No. NIK</Label>
          <Input
            value={form.nik ?? ""}
            onChange={(e) => set("nik", e.target.value)}
            placeholder="Masukan NIK"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-1.5 sm:max-w-xs">
        <Label>Termin</Label>
        <Input
          type="number"
          min={0}
          value={form.payment_term ?? ""}
          onChange={(e) => set("payment_term", e.target.value ? Number(e.target.value) : null)}
          placeholder="0"
          disabled={disabled}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Keterangan</Label>
        <Textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Masukkan keterangan"
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  )
}

// --- Tab: PIC ---
function PICTab({
  form,
  set,
  disabled,
}: {
  form: ContactFormData
  set: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nama</Label>
          <Input
            value={form.contact_person ?? ""}
            onChange={(e) => set("contact_person", e.target.value)}
            placeholder="Masukkan nama penagih"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Jabatan</Label>
          <Input
            value={form.pic_title ?? ""}
            onChange={(e) => set("pic_title", e.target.value)}
            placeholder="Masukkan jabatan"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>No. Telepon</Label>
          <Input
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+628xxxxx"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@contoh.com"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-1.5 sm:max-w-xs">
        <Label>Fax</Label>
        <Input
          value={form.fax ?? ""}
          onChange={(e) => set("fax", e.target.value)}
          placeholder="021-xxxx"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

// --- Tab: Alamat ---
function AlamatTab({
  form,
  set,
  coordinate,
  onCoordinateChange,
  disabled,
  provinceOptions,
  provincesLoading,
}: {
  form: ContactFormData
  set: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void
  coordinate: string
  onCoordinateChange: (v: string) => void
  disabled: boolean
  provinceOptions: { value: string; label: string }[]
  provincesLoading: boolean
}) {
  const showShipping = !(form.shipping_same_as_billing ?? true)

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Pin Lokasi</Label>
        <LocationMapPicker
          value={coordinate}
          onChange={onCoordinateChange}
          disabled={disabled}
        />
      </div>

      <Separator />

      <h3 className="text-sm font-semibold">Alamat Penagihan</h3>

      <div className="space-y-1.5">
        <Label>Detail Alamat<Req /></Label>
        <Textarea
          value={form.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Cth: Blok, Unit No, Patokan"
          disabled={disabled}
          rows={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Provinsi</Label>
          <Combobox
            options={provinceOptions}
            value={form.province ?? null}
            onChange={(v) => set("province", v ?? undefined)}
            placeholder="Pilih Provinsi"
            searchPlaceholder="Cari provinsi"
            disabled={disabled || provincesLoading}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Kode Pos</Label>
          <Input
            value={form.postal_code ?? ""}
            onChange={(e) => set("postal_code", e.target.value)}
            placeholder="Kode Pos"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="shipping_same"
          checked={form.shipping_same_as_billing ?? true}
          onCheckedChange={(v) => set("shipping_same_as_billing", v === true)}
          disabled={disabled}
        />
        <Label htmlFor="shipping_same" className="!mt-0 cursor-pointer">
          Alamat pengiriman sama dengan penagihan.
        </Label>
      </div>

      {showShipping && (
        <>
          <Separator />
          <h3 className="text-sm font-semibold">Alamat Pengiriman</h3>

          <div className="space-y-1.5">
            <Label>Detail Alamat</Label>
            <Textarea
              value={form.shipping_address ?? ""}
              onChange={(e) => set("shipping_address", e.target.value)}
              placeholder="Alamat Pengirim"
              disabled={disabled}
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Provinsi</Label>
              <Combobox
                options={provinceOptions}
                value={form.shipping_province ?? null}
                onChange={(v) => set("shipping_province", v ?? undefined)}
                placeholder="Pilih Provinsi"
                searchPlaceholder="Cari provinsi"
                disabled={disabled || provincesLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kode Pos</Label>
              <Input
                value={form.shipping_postal_code ?? ""}
                onChange={(e) => set("shipping_postal_code", e.target.value)}
                placeholder="Kode Pos"
                disabled={disabled}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
