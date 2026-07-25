"use client";

import { FormSkeleton } from "@/components/ui/page-skeleton";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, Loader2Icon, LockIcon } from "lucide-react";

import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { PhoneInput } from "@/components/ui/phone-input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import { cn } from "@/lib/utils";
import { isValidPhone } from "@/lib/phone";
import {
  useContactDetail,
  useContactCategories,
  useAccountPayableOptions,
  useCreateContact,
  useUpdateContact,
} from "@/hooks/kontak-pemasok/use-contacts";
import { useProvinces } from "@/hooks/manajemen-rak/use-regions";
import {
  LocationMapPicker,
  formatCoordinate,
  parseCoordinate,
} from "@/components/dashboard/manajemen-rak/lokasi/location-map-picker";
import type {
  ContactFormData,
} from "@/types/kontak-pemasok/contact";

const LIST_HREF = "/dashboard/kontak-pemasok";

type Section = "umum" | "pic" | "alamat";

const TYPE_OPTIONS = [
  { value: "SUPPLIER", label: "Pemasok" },
  { value: "BOTH", label: "Pemasok dan Pelanggan" },
];

const FIELD_SECTION_MAP: Partial<Record<keyof ContactFormData, Section>> = {
  name: "umum",
  type: "umum",
  category_id: "umum",
  is_company: "umum",
  tax_id: "umum",
  notes: "umum",
  contact_person: "pic",
  phone: "pic",
  email: "pic",
  address: "alamat",
  province: "alamat",
  postal_code: "alamat",
  shipping_address: "alamat",
  shipping_province: "alamat",
  shipping_postal_code: "alamat",
  shipping_same_as_billing: "alamat",
};

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

function validateForm(f: ContactFormData): FormErrors {
  const errs: FormErrors = {};
  if (!f.name.trim()) errs.name = "Nama Kontak wajib diisi.";
  if (f.phone && !isValidPhone(f.phone)) {
    errs.phone = "Format No. Telepon tidak valid.";
  }
  if (!f.address?.trim()) {
    errs.address = "Detail alamat penagihan wajib diisi.";
  }
  return errs;
}

function Req() {
  return <span className="text-destructive"> *</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function toRegionOptions(items: { id: string; nama: string }[] | undefined) {
  return (items ?? []).map((r) => ({ value: r.id, label: r.nama }));
}

interface KontakFormPageProps {
  mode: "create" | "edit";
  id?: string;
}

export function KontakFormPage({ mode, id }: KontakFormPageProps) {
  const router = useRouter();
  const [section, setSection] = React.useState<Section>("umum");

  const detail = useContactDetail(mode === "edit" ? id : undefined);
  const { data: categories = [] } = useContactCategories();
  const { data: accountPayableOptions = [] } = useAccountPayableOptions();
  const provinces = useProvinces();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const [form, setForm] = React.useState<ContactFormData>({
    name: "",
    type: "SUPPLIER",
    is_company: false,
    shipping_same_as_billing: true,
    tax_type: "NON_PKP",
  });
  const [coordinate, setCoordinate] = React.useState<string>("");
  const [errors, setErrors] = React.useState<FormErrors>({});

  const [prefilled, setPrefilled] = React.useState(false);
  const [prevData, setPrevData] = React.useState(detail.data);
  const [prevMode, setPrevMode] = React.useState(mode);

  if (mode !== prevMode || detail.data !== prevData) {
    setPrevMode(mode);
    setPrevData(detail.data);
    if (mode === "edit" && detail.data && !prefilled) {
      setPrefilled(true);
      const d = detail.data;
      setForm({
        name: d.name,
        company_name: d.company_name ?? undefined,
        type:
          d.type === "CUSTOMER" ? "SUPPLIER" : (d.type as "SUPPLIER" | "BOTH"),
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
        tax_type: d.tax_type ?? "NON_PKP",
      });
      if (d.latitude != null && d.longitude != null) {
        setCoordinate(formatCoordinate(d.latitude, d.longitude));
      }
    }
  }

  const locked = mode === "edit" && Boolean(detail.data?.is_system);
  const saving = createContact.isPending || updateContact.isPending;

  function set<K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function jumpToFirstError(errs: FormErrors) {
    const firstKey = Object.keys(errs)[0] as keyof ContactFormData | undefined;
    if (firstKey) {
      setSection(FIELD_SECTION_MAP[firstKey] ?? "umum");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      jumpToFirstError(fieldErrors);
      return;
    }
    setErrors({});

    const coord = parseCoordinate(coordinate);
    const payload: ContactFormData = {
      ...form,
      latitude: coord?.lat ?? null,
      longitude: coord?.lng ?? null,
    };

    try {
      if (mode === "create") {
        await createContact.mutateAsync(payload);
      } else if (id) {
        await updateContact.mutateAsync({ id, data: payload });
      }
      router.push(LIST_HREF);
    } catch (err) {
      const body = err as { errors?: Record<string, string[] | string> };
      if (body?.errors && typeof body.errors === "object") {
        const backendErrors: FormErrors = {};
        for (const [key, messages] of Object.entries(body.errors)) {
          backendErrors[key as keyof ContactFormData] = Array.isArray(
            messages,
          )
            ? messages[0]
            : String(messages);
        }
        setErrors(backendErrors);
        jumpToFirstError(backendErrors);
      }
    }
  }

  const title = mode === "create" ? "Buat Pemasok" : "Edit Pemasok";

  if (mode === "edit" && detail.isLoading) {
    return (
      <FormSkeleton />
    );
  }

  if (mode === "edit" && detail.isError) {
    return (
      <div className="py-24 text-center text-sm text-destructive">
        Gagal memuat kontak.
      </div>
    );
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.code ? `${c.code} - ${c.name}` : c.name,
  }));

  const apOptions = accountPayableOptions.map((o) => ({
    value: o.code,
    label: o.name,
  }));

  const navItems: { key: Section; label: string }[] = [
    { key: "umum", label: "Umum" },
    { key: "pic", label: "PIC" },
    { key: "alamat", label: "Alamat" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PageTitle
        title={title}
        breadcrumb={[
          { label: "Pembelian" },
          { label: "Kontak Pemasok", href: LIST_HREF },
          { label: title },
        ]}
      />

      {locked && (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <LockIcon className="size-4" />
          Kontak sistem ini terkunci dan tidak dapat diubah.
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-destructive">
              Lengkapi data berikut sebelum menyimpan:
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-destructive/90">
              {Object.values(errors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex flex-col gap-2">
          {navItems.map((n) => {
            const hasError = Object.keys(errors).some(
              (f) =>
                (FIELD_SECTION_MAP[f as keyof ContactFormData] ?? "umum") ===
                n.key,
            );
            return (
              <Button key={n.key} type="button" variant="outline" onClick={() => setSection(n.key)} className={cn("h-auto justify-start rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors", section === n.key ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20" : "border-border bg-background hover:bg-muted")}>
                {n.label}
                {hasError && (
                  <span className="ml-auto size-1.5 shrink-0 rounded-full bg-destructive" />
                )}
              </Button>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-border bg-card p-6">
          {section === "umum" && (
            <UmumTab
              form={form}
              set={set}
              disabled={locked}
              categoryOptions={categoryOptions}
              apOptions={apOptions}
              errors={errors}
            />
          )}
          {section === "pic" && (
            <PICTab form={form} set={set} disabled={locked} errors={errors} />
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
              errors={errors}
            />
          )}
        </div>
      </div>

      <FormFooter>
        <Button variant="outline" asChild>
          <Link href={LIST_HREF}>Batal</Link>
        </Button>
        {!locked && (
          <Button type="submit" variant="primary" disabled={saving}>
            {saving && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        )}
      </FormFooter>
    </form>
  );
}

function UmumTab({
  form,
  set,
  disabled,
  categoryOptions,
  apOptions,
  errors,
}: {
  form: ContactFormData;
  set: <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) => void;
  disabled: boolean;
  categoryOptions: { value: string; label: string }[];
  apOptions: { value: string; label: string }[];
  errors: FormErrors;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>
          Nama Kontak
          <Req />
        </Label>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Masukkan nama kontak"
          disabled={disabled}
          aria-invalid={!!errors.name}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            Tipe
            <Req />
          </Label>
          <Combobox
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={(v) =>
              set("type", (v as "SUPPLIER" | "BOTH") ?? "SUPPLIER")
            }
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

      <div className="space-y-1.5 sm:max-w-xs">
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

      <div className="space-y-1.5">
        <Label>Keterangan</Label>
        <Textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Masukkan keterangan"
          disabled={disabled}
          rows={3}
          aria-invalid={!!errors.notes}
        />
        <FieldError message={errors.notes} />
      </div>
    </div>
  );
}

function PICTab({
  form,
  set,
  disabled,
  errors,
}: {
  form: ContactFormData;
  set: <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) => void;
  disabled: boolean;
  errors: FormErrors;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Nama</Label>
        <Input
          value={form.contact_person ?? ""}
          onChange={(e) => set("contact_person", e.target.value)}
          placeholder="Masukkan nama penagih"
          disabled={disabled}
          aria-invalid={!!errors.contact_person}
        />
        <FieldError message={errors.contact_person} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>No. Telepon</Label>
          <PhoneInput
            value={form.phone ?? ""}
            onChange={(v) => set("phone", v || undefined)}
            disabled={disabled}
            invalid={!!errors.phone}
          />
          <FieldError message={errors.phone} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@contoh.com"
            disabled={disabled}
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email} />
        </div>
      </div>
    </div>
  );
}

function AlamatTab({
  form,
  set,
  coordinate,
  onCoordinateChange,
  disabled,
  provinceOptions,
  provincesLoading,
  errors,
}: {
  form: ContactFormData;
  set: <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) => void;
  coordinate: string;
  onCoordinateChange: (v: string) => void;
  disabled: boolean;
  provinceOptions: { value: string; label: string }[];
  provincesLoading: boolean;
  errors: FormErrors;
}) {
  const showShipping = !(form.shipping_same_as_billing ?? true);

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

      <SectionTitle>Alamat Penagihan</SectionTitle>

      <div className="space-y-1.5">
        <Label>
          Detail Alamat
          <Req />
        </Label>
        <Textarea
          value={form.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Cth: Blok, Unit No, Patokan"
          disabled={disabled}
          rows={2}
          aria-invalid={!!errors.address}
        />
        <FieldError message={errors.address} />
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
          <FieldError message={errors.province} />
        </div>
        <div className="space-y-1.5">
          <Label>Kode Pos</Label>
          <Input
            value={form.postal_code ?? ""}
            onChange={(e) => set("postal_code", e.target.value)}
            placeholder="Kode Pos"
            disabled={disabled}
            aria-invalid={!!errors.postal_code}
          />
          <FieldError message={errors.postal_code} />
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
          <SectionTitle>Alamat Pengiriman</SectionTitle>

          <div className="space-y-1.5">
            <Label>Detail Alamat</Label>
            <Textarea
              value={form.shipping_address ?? ""}
              onChange={(e) => set("shipping_address", e.target.value)}
              placeholder="Alamat Pengirim"
              disabled={disabled}
              rows={2}
              aria-invalid={!!errors.shipping_address}
            />
            <FieldError message={errors.shipping_address} />
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
              <FieldError message={errors.shipping_province} />
            </div>
            <div className="space-y-1.5">
              <Label>Kode Pos</Label>
              <Input
                value={form.shipping_postal_code ?? ""}
                onChange={(e) => set("shipping_postal_code", e.target.value)}
                placeholder="Kode Pos"
                disabled={disabled}
                aria-invalid={!!errors.shipping_postal_code}
              />
              <FieldError message={errors.shipping_postal_code} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
