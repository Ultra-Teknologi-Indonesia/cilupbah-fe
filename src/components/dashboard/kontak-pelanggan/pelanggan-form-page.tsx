"use client";

import { FormSkeleton } from "@/components/ui/page-skeleton";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon, LockIcon } from "lucide-react";
import { toast } from "sonner";

import { PageTitle } from "@/components/dashboard/page-title";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import { cn } from "@/lib/utils";
import { isValidPhone } from "@/lib/phone";
import {
  useContactDetail,
  useContactCategories,
  useCreateContact,
  useUpdateContact,
} from "@/hooks/kontak-pemasok/use-contacts";
import { useCountries, useProvinces } from "@/hooks/manajemen-rak/use-regions";
import {
  LocationMapPicker,
  formatCoordinate,
  parseCoordinate,
} from "@/components/dashboard/manajemen-rak/lokasi/location-map-picker";
import type {
  ContactFormData,
} from "@/types/kontak-pemasok/contact";

const LIST_HREF = "/dashboard/kontak-pelanggan?tab=pelanggan";

type Section = "umum" | "pic" | "alamat" | "pajak";

const SOURCE_OPTIONS = [
  { value: "WALK_IN", label: "Walk In" },
  { value: "ONLINE", label: "Online" },
  { value: "REFERRAL", label: "Referral" },
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "SOCIAL_MEDIA", label: "Media Sosial" },
  { value: "OTHER", label: "Lainnya" },
];

function Req() {
  return <span className="text-destructive"> *</span>;
}

function toRegionOptions(items: { id: string; nama: string }[] | undefined) {
  return (items ?? []).map((r) => ({ value: r.id, label: r.nama }));
}

interface PelangganFormPageProps {
  mode: "create" | "edit";
  id?: string;
}

export function PelangganFormPage({ mode, id }: PelangganFormPageProps) {
  const router = useRouter();
  const [section, setSection] = React.useState<Section>("umum");

  const detail = useContactDetail(mode === "edit" ? id : undefined);
  const { data: categories = [] } = useContactCategories();
  const countries = useCountries();
  const provinces = useProvinces();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const [form, setForm] = React.useState<ContactFormData>({
    name: "",
    type: "CUSTOMER",
    is_company: false,
    shipping_same_as_billing: true,
    nationality: "Indonesia",
    tax_type: "NON_PKP",
    is_dropshipper: false,
    is_reseller: false,
    npwp_use_different: false,
  });
  const [coordinate, setCoordinate] = React.useState<string>("");

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
          d.type === "SUPPLIER" ? "CUSTOMER" : (d.type as "CUSTOMER" | "BOTH"),
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
        source: d.source ?? undefined,
        nationality: d.nationality ?? "Indonesia",
        birth_date: d.birth_date ?? undefined,
        is_dropshipper: d.is_dropshipper ?? false,
        is_reseller: d.is_reseller ?? false,
        tax_type: d.tax_type ?? "NON_PKP",
        nik_photo_path: d.nik_photo_path ?? undefined,
        npwp_photo_path: d.npwp_photo_path ?? undefined,
        npwp_use_different: d.npwp_use_different ?? false,
        npwp_name: d.npwp_name ?? undefined,
        npwp_address: d.npwp_address ?? undefined,
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setSection("umum");
      toast.error("Nama Kontak wajib diisi.");
      return;
    }
    if (form.phone && !isValidPhone(form.phone)) {
      setSection("pic");
      toast.error("Format No. Telepon tidak valid.");
      return;
    }
    if (!form.address?.trim()) {
      setSection("alamat");
      toast.error("Detail alamat penagihan wajib diisi.");
      return;
    }
    if (form.tax_type !== "PKP" && form.tax_type !== "NON_PKP") {
      setSection("pajak");
      toast.error("Tipe pajak wajib dipilih.");
      return;
    }

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
    } catch {}
  }

  const title = mode === "create" ? "Buat Pelanggan" : "Edit Pelanggan";

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

  const categoryOptions = categories
    .filter((c) => !c.type || c.type === "CUSTOMER" || c.type === "BOTH")
    .map((c) => ({
      value: c.id,
      label: c.code ? `${c.code} - ${c.name}` : c.name,
    }));

  const countryOptions = (countries.data ?? []).map((c) => ({
    value: c.name,
    label: c.name,
  }));

  const navItems: { key: Section; label: string }[] = [
    { key: "umum", label: "Umum" },
    { key: "pic", label: "Penanggung Jawab" },
    { key: "alamat", label: "Alamat" },
    { key: "pajak", label: "Informasi Pajak" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PageTitle
        title={title}
        backHref={LIST_HREF}
        breadcrumb={[
          { label: "Penjualan" },
          { label: "Kontak Pelanggan", href: LIST_HREF },
          { label: title },
        ]}
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
                  : "border-border bg-background hover:bg-muted",
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
              countryOptions={countryOptions}
              countriesLoading={countries.isLoading}
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
          {section === "pajak" && (
            <PajakTab form={form} set={set} disabled={locked} />
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
  countryOptions,
  countriesLoading,
}: {
  form: ContactFormData;
  set: <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) => void;
  disabled: boolean;
  categoryOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  countriesLoading: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            Tipe
            <Req />
          </Label>
          <Select
            value={form.type}
            onValueChange={(v) => set("type", v as "CUSTOMER" | "BOTH")}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUSTOMER">Pelanggan</SelectItem>
              <SelectItem value="BOTH">Pemasok dan Pelanggan</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Sumber</Label>
          <Combobox
            options={SOURCE_OPTIONS}
            value={form.source ?? null}
            onChange={(v) => set("source", v ?? undefined)}
            placeholder="Pilih sumber"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <Select
            value={form.category_id ?? ""}
            onValueChange={(v) => set("category_id", v || undefined)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Label>Kewarganegaraan</Label>
          <Combobox
            options={countryOptions}
            value={form.nationality ?? "Indonesia"}
            onChange={(v) => set("nationality", v ?? "Indonesia")}
            placeholder="Pilih negara"
            searchPlaceholder="Cari negara"
            disabled={disabled || countriesLoading}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tanggal Lahir</Label>
          <Input
            type="date"
            value={form.birth_date ?? ""}
            onChange={(e) => set("birth_date", e.target.value)}
            disabled={disabled}
          />
        </div>
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
  );
}

function PICTab({
  form,
  set,
  disabled,
}: {
  form: ContactFormData;
  set: <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Nama</Label>
        <Input
          value={form.contact_person ?? ""}
          onChange={(e) => set("contact_person", e.target.value)}
          placeholder="Nama penanggung jawab"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>No. Telepon</Label>
          <PhoneInput
            value={form.phone ?? ""}
            onChange={(v) => set("phone", v || undefined)}
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

      <Separator />

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="is_dropshipper"
            checked={form.is_dropshipper ?? false}
            onCheckedChange={(v) => set("is_dropshipper", v === true)}
            disabled={disabled}
          />
          <Label htmlFor="is_dropshipper" className="!mt-0 cursor-pointer">
            Dropshipper
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="is_reseller"
            checked={form.is_reseller ?? false}
            onCheckedChange={(v) => set("is_reseller", v === true)}
            disabled={disabled}
          />
          <Label htmlFor="is_reseller" className="!mt-0 cursor-pointer">
            Reseller
          </Label>
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
          <SectionTitle>Alamat Pengiriman</SectionTitle>

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
  );
}

function PajakTab({
  form,
  set,
  disabled,
}: {
  form: ContactFormData;
  set: <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K],
  ) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>
          Tipe
          <Req />
        </Label>
        <RadioGroup
          value={form.tax_type ?? "NON_PKP"}
          onValueChange={(v) => set("tax_type", v as "PKP" | "NON_PKP")}
          disabled={disabled}
          className="flex flex-row items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem id="tax_type_non_pkp" value="NON_PKP" />
            <Label htmlFor="tax_type_non_pkp" className="!mt-0 cursor-pointer">
              Non PKP
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="tax_type_pkp" value="PKP" />
            <Label htmlFor="tax_type_pkp" className="!mt-0 cursor-pointer">
              PKP
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="npwp_use_different"
          checked={form.npwp_use_different ?? false}
          onCheckedChange={(v) => set("npwp_use_different", v === true)}
          disabled={disabled}
        />
        <Label htmlFor="npwp_use_different" className="!mt-0 cursor-pointer">
          Gunakan data NPWP yang berbeda dengan data kontak
        </Label>
      </div>

      {form.npwp_use_different && (
        <>
          <div className="space-y-1.5">
            <Label>Nama NPWP</Label>
            <Input
              value={form.npwp_name ?? ""}
              onChange={(e) => set("npwp_name", e.target.value)}
              placeholder="Nama pada NPWP"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Alamat NPWP</Label>
            <Textarea
              value={form.npwp_address ?? ""}
              onChange={(e) => set("npwp_address", e.target.value)}
              placeholder="Alamat pada NPWP"
              disabled={disabled}
              rows={2}
            />
          </div>
        </>
      )}
    </div>
  );
}
