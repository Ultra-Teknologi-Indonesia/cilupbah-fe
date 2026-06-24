"use client"

import * as React from "react"
import { Loader2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateContact } from "@/hooks/kontak-pemasok/use-contacts"
import type { ContactCategory, AccountPayableOption } from "@/types/kontak-pemasok/contact"

interface TambahKontakDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ContactCategory[]
  accountPayableOptions: AccountPayableOption[]
}

const EMPTY_FORM = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  mobile: "",
  contact_person: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  tax_id: "",
  payment_term: "NET30",
  notes: "",
  type: "SUPPLIER" as const,
  category_id: "",
  is_company: false,
  account_payable: "",
}

export function TambahKontakDialog({
  open,
  onOpenChange,
  categories,
  accountPayableOptions: apOptions,
}: TambahKontakDialogProps) {
  const [form, setForm] = React.useState(EMPTY_FORM)
  const createMut = useCreateContact()

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = form.name.trim()
    if (!trimmed) return

    const payload = {
      name: trimmed,
      company_name: form.company_name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      mobile: form.mobile || undefined,
      contact_person: form.contact_person || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      province: form.province || undefined,
      postal_code: form.postal_code || undefined,
      tax_id: form.tax_id || undefined,
      payment_term: form.payment_term || undefined,
      notes: form.notes || undefined,
      type: form.type as "SUPPLIER" | "BOTH",
      category_id: form.category_id || undefined,
      is_company: form.is_company || undefined,
      account_payable: form.account_payable || undefined,
    }

    createMut.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM)
        onOpenChange(false)
      },
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(EMPTY_FORM)
    onOpenChange(next)
  }

  const categoryOptions = [
    { value: "", label: "Tanpa Kategori" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  const typeOptions = [
    { value: "SUPPLIER", label: "Pemasok" },
    { value: "BOTH", label: "Pemasok dan Pelanggan" },
  ]

  const accountPayableOptions = [
    { value: "", label: "Pilih Akun" },
    ...apOptions.map((o) => ({ value: o.code, label: o.name })),
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={createMut.isPending ? undefined : handleOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-2xl"
      >
        <LiquidGlass
          radius={28}
          intensity="strong"
          className="bg-white/85 dark:bg-neutral-900/85"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-lg">Tambah Pemasok</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Tambah kontak pemasok baru.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">Info Utama</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Nama *</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Nama kontak"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-company">Perusahaan</Label>
                    <Input
                      id="contact-company"
                      value={form.company_name}
                      onChange={(e) => set("company_name", e.target.value)}
                      placeholder="Nama perusahaan"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="email@contoh.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-phone">Telepon</Label>
                    <Input
                      id="contact-phone"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="021-xxxxxxx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-mobile">Mobile</Label>
                    <Input
                      id="contact-mobile"
                      value={form.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-person">Contact Person</Label>
                    <Input
                      id="contact-person"
                      value={form.contact_person}
                      onChange={(e) => set("contact_person", e.target.value)}
                      placeholder="Nama PIC"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">Alamat</legend>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-address">Alamat</Label>
                  <Textarea
                    id="contact-address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Alamat lengkap"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-city">Kota</Label>
                    <Input
                      id="contact-city"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Kota"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-province">Provinsi</Label>
                    <Input
                      id="contact-province"
                      value={form.province}
                      onChange={(e) => set("province", e.target.value)}
                      placeholder="Provinsi"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-postal">Kode Pos</Label>
                    <Input
                      id="contact-postal"
                      value={form.postal_code}
                      onChange={(e) => set("postal_code", e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">Lainnya</legend>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="contact-is-company"
                    checked={form.is_company}
                    onCheckedChange={(v) => setForm((prev) => ({ ...prev, is_company: !!v }))}
                  />
                  <Label htmlFor="contact-is-company" className="cursor-pointer text-sm font-normal">
                    Perusahaan
                  </Label>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tipe</Label>
                    <Combobox
                      options={typeOptions}
                      value={form.type}
                      onChange={(v) => set("type", v ?? "SUPPLIER")}
                      placeholder="Pilih tipe"
                      className="h-9 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <Combobox
                      options={categoryOptions}
                      value={form.category_id}
                      onChange={(v) => set("category_id", v ?? "")}
                      placeholder="Pilih kategori"
                      className="h-9 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Akun Hutang</Label>
                    <Combobox
                      options={accountPayableOptions}
                      value={form.account_payable}
                      onChange={(v) => set("account_payable", v ?? "")}
                      placeholder="Pilih akun hutang"
                      className="h-9 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-tax">NPWP</Label>
                    <Input
                      id="contact-tax"
                      value={form.tax_id}
                      onChange={(e) => set("tax_id", e.target.value)}
                      placeholder="Nomor NPWP"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-term">Termin Pembayaran</Label>
                    <Input
                      id="contact-term"
                      value={form.payment_term}
                      onChange={(e) => set("payment_term", e.target.value)}
                      placeholder="NET30"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-notes">Catatan</Label>
                  <Textarea
                    id="contact-notes"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Catatan tambahan"
                    rows={2}
                  />
                </div>
              </fieldset>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createMut.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!form.name.trim() || createMut.isPending}
              >
                {createMut.isPending && <Loader2Icon className="animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
