"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import { ImageUploadField } from "@/components/dashboard/pengaturan/umum/image-upload-field";
import {
  useCompanyProfile,
  useSaveCompanyProfile,
} from "@/hooks/pengaturan/use-company-profile";
import { useCities, useProvinces } from "@/hooks/manajemen-rak/use-regions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermissions } from "@/hooks/auth/use-permissions";
import {
  companyProfileSchema,
  type CompanyProfileFormValues,
} from "@/schemas/pengaturan/company-profile";

const EMPTY: CompanyProfileFormValues = {
  legalName: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  email: "",
  logoMediaId: null,
  signatureMediaId: null,
};

export function IdentitasPerusahaanForm() {
  const { data, isLoading } = useCompanyProfile();
  const save = useSaveCompanyProfile();
  const { can } = usePermissions();
  const canEdit = can("edit-pengaturan-sistem");

  // null = belum disentuh (pakai nilai server); { url } = hasil unggah/hapus lokal.
  const [logoOverride, setLogoOverride] = React.useState<{
    url: string | null;
  } | null>(null);
  const [signatureOverride, setSignatureOverride] = React.useState<{
    url: string | null;
  } | null>(null);

  const logoUrl = logoOverride ? logoOverride.url : (data?.logoUrl ?? null);
  const signatureUrl = signatureOverride
    ? signatureOverride.url
    : (data?.signatureUrl ?? null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: EMPTY,
  });

  const [provinceId, setProvinceId] = React.useState<string | null>(null);
  const [provinceQuery, setProvinceQuery] = React.useState("");
  const [cityQuery, setCityQuery] = React.useState("");
  const debouncedProvinceQuery = useDebouncedValue(provinceQuery, 300);
  const debouncedCityQuery = useDebouncedValue(cityQuery, 300);
  const provinces = useProvinces(debouncedProvinceQuery || undefined);
  const cities = useCities(
    provinceId ?? undefined,
    debouncedCityQuery || undefined,
  );

  const provinceOptions = React.useMemo(
    () => (provinces.data ?? []).map((p) => ({ value: p.id, label: p.nama })),
    [provinces.data],
  );

  const currentCity = watch("city") ?? "";
  const cityOptions = React.useMemo(() => {
    const fromApi = (cities.data ?? []).map((c) => ({
      value: c.nama,
      label: c.nama,
    }));
    if (currentCity && !fromApi.some((o) => o.value === currentCity)) {
      return [{ value: currentCity, label: currentCity }, ...fromApi];
    }
    return fromApi;
  }, [cities.data, currentCity]);

  React.useEffect(() => {
    if (!data) return;
    reset({
      legalName: data.legalName ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      postalCode: data.postalCode ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      logoMediaId: data.logoMediaId,
      signatureMediaId: data.signatureMediaId,
    });
    setProvinceId(null);
    setProvinceQuery("");
    setCityQuery("");
  }, [data, reset]);

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      {
        legalName: values.legalName,
        address: values.address || null,
        city: values.city || null,
        postalCode: values.postalCode || null,
        phone: values.phone || null,
        email: values.email || null,
        logoMediaId: values.logoMediaId ?? null,
        signatureMediaId: values.signatureMediaId ?? null,
      },
      {
        onSuccess: () => {
          setLogoOverride(null);
          setSignatureOverride(null);
        },
      },
    );
  });

  const handleReset = () => {
    setLogoOverride(null);
    setSignatureOverride(null);
    setProvinceId(null);
    setProvinceQuery("");
    setCityQuery("");
    if (!data) {
      reset(EMPTY);
      return;
    }
    reset({
      legalName: data.legalName ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      postalCode: data.postalCode ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      logoMediaId: data.logoMediaId,
      signatureMediaId: data.signatureMediaId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-4xl" />
        <Skeleton className="h-40 w-full rounded-4xl" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Identitas Perusahaan</CardTitle>
          <CardDescription>
            Data ini muncul di kop semua dokumen cetak: Surat Jalan, Pengambilan
            Barang, Penerimaan, Penyesuaian, Faktur, dan lainnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="legalName">
              Nama Perusahaan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legalName"
              placeholder="PT ULTRA TEKNOLOGI INDONESIA"
              aria-invalid={!!errors.legalName}
              {...register("legalName")}
            />
            {errors.legalName ? (
              <p className="text-xs text-destructive">
                {errors.legalName.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telepon</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  invalid={!!errors.phone}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ops@perusahaan.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Jl. Contoh No. 1, Kecamatan, Kabupaten/Kota"
              {...register("address")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="province">Provinsi</Label>
            <Combobox
              id="province"
              options={provinceOptions}
              value={provinceId}
              onChange={(v) => {
                setProvinceId(v);
                setCityQuery("");
                setValue("city", "", { shouldDirty: true });
              }}
              onQueryChange={setProvinceQuery}
              loading={provinces.isLoading || provinces.isFetching}
              placeholder="Pilih provinsi"
              searchPlaceholder="Cari provinsi"
              disabled={!canEdit}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">Kota</Label>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Combobox
                  id="city"
                  options={cityOptions}
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ?? "")}
                  onQueryChange={setCityQuery}
                  loading={cities.isLoading || cities.isFetching}
                  placeholder="Pilih kota"
                  searchPlaceholder="Cari kota"
                  disabled={!canEdit || !provinceId}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input
              id="postalCode"
              placeholder="40123"
              {...register("postalCode")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo & Tanda Tangan</CardTitle>
          <CardDescription>
            Logo tampil di kop dokumen; tanda tangan/stempel tampil di area
            pengesahan Surat Jalan dan Faktur. Format PNG/JPG, maksimal 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ImageUploadField
            label="Logo Perusahaan"
            hint="Disarankan latar transparan (PNG)."
            url={logoUrl}
            disabled={!canEdit}
            onChange={(media) => {
              setValue("logoMediaId", media?.uuid ?? null, {
                shouldDirty: true,
              });
              setLogoOverride({ url: media?.url ?? null });
            }}
          />
          <ImageUploadField
            label="Tanda Tangan / Stempel"
            hint="Muncul di area pengesahan cetakan."
            url={signatureUrl}
            disabled={!canEdit}
            onChange={(media) => {
              setValue("signatureMediaId", media?.uuid ?? null, {
                shouldDirty: true,
              });
              setSignatureOverride({ url: media?.url ?? null });
            }}
          />
        </CardContent>
      </Card>

      <FormFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={handleReset}
          disabled={save.isPending || !isDirty}
        >
          Batal
        </Button>
        <Button type="submit" disabled={save.isPending || !canEdit}>
          {save.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan…
            </>
          ) : (
            "Simpan"
          )}
        </Button>
      </FormFooter>
    </form>
  );
}
