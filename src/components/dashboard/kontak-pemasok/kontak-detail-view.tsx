"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2Icon, LockIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { PageTitle } from "@/components/dashboard/page-title"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import { useContactDetail, useDeleteContact } from "@/hooks/kontak-pemasok/use-contacts"
import { LocationMapPicker } from "@/components/dashboard/manajemen-rak/lokasi/location-map-picker"
import { formatCoordinate } from "@/components/dashboard/manajemen-rak/lokasi/location-map-picker"

const LIST_HREF = "/dashboard/kontak-pemasok"

const TYPE_LABELS: Record<string, string> = {
  SUPPLIER: "Pemasok",
  BOTH: "Pemasok dan Pelanggan",
  CUSTOMER: "Pelanggan",
}

type Section = "umum" | "pic" | "alamat"

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  )
}

export function KontakDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: contact, isLoading, isError } = useContactDetail(id)
  const deleteMut = useDeleteContact()
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [section, setSection] = React.useState<Section>("umum")

  function handleDelete() {
    deleteMut.mutate(id, {
      onSuccess: () => {
        setDeleteOpen(false)
        router.push(LIST_HREF)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Memuat kontak…
      </div>
    )
  }

  if (isError || !contact) {
    return (
      <div className="py-24 text-center text-sm text-destructive">
        Gagal memuat kontak.
      </div>
    )
  }

  const coordinate =
    contact.latitude != null && contact.longitude != null
      ? formatCoordinate(contact.latitude, contact.longitude)
      : ""

  const navItems: { key: Section; label: string }[] = [
    { key: "umum", label: "Umum" },
    { key: "pic", label: "PIC" },
    { key: "alamat", label: "Alamat" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={contact.name}
        breadcrumb={[
          { label: "Pembelian" },
          { label: "Kontak Pemasok", href: LIST_HREF },
          { label: contact.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!contact.is_system && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className="h-4 w-4" />
                Hapus
              </Button>
            )}
            <Button variant="primary" asChild>
              <Link href={`/dashboard/kontak-pemasok/${id}/edit`}>
                <PencilIcon className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        }
      />

      {contact.is_system && (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <LockIcon className="size-4" />
          Kontak sistem dari marketplace — tidak dapat dihapus.
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
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama Kontak" value={contact.name} />
                <Field label="Tipe" value={TYPE_LABELS[contact.type]} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Kategori"
                  value={
                    contact.category
                      ? contact.category.code
                        ? `${contact.category.code} - ${contact.category.name}`
                        : contact.category.name
                      : undefined
                  }
                />
                <Field label="Akun Hutang" value={contact.account_payable} />
              </div>
              <Field label="Perusahaan" value={contact.is_company ? "Ya" : "Tidak"} />
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="No. NPWP" value={contact.tax_id} />
                <Field label="No. NIK" value={contact.nik} />
              </div>
              <Field label="Termin" value={contact.payment_term != null ? `${contact.payment_term} hari` : undefined} />
              <Field label="Keterangan" value={contact.notes} />
            </div>
          )}

          {section === "pic" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama" value={contact.contact_person} />
                <Field label="Jabatan" value={contact.pic_title} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="No. Telepon" value={contact.phone} />
                <Field label="Email" value={contact.email} />
              </div>
              <Field label="Fax" value={contact.fax} />
            </div>
          )}

          {section === "alamat" && (
            <div className="space-y-5">
              {coordinate && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Pin Lokasi</p>
                  <LocationMapPicker value={coordinate} onChange={() => {}} disabled />
                </div>
              )}
              <Separator />
              <h3 className="text-sm font-semibold">Alamat Penagihan</h3>
              <Field label="Detail Alamat" value={contact.address} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Provinsi" value={contact.province} />
                <Field label="Kode Pos" value={contact.postal_code} />
              </div>

              <Separator />
              <h3 className="text-sm font-semibold">Alamat Pengiriman</h3>
              {contact.shipping_same_as_billing ? (
                <p className="text-sm text-muted-foreground">Sama dengan alamat penagihan.</p>
              ) : (
                <>
                  <Field label="Detail Alamat" value={contact.shipping_address} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Provinsi" value={contact.shipping_province} />
                    <Field label="Kode Pos" value={contact.shipping_postal_code} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Kontak"
        description={`Apakah Anda yakin ingin menghapus kontak "${contact.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
