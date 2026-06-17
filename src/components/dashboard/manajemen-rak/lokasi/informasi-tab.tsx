"use client"

import { useFormContext } from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Combobox } from "@/components/ui/combobox"
import { Separator } from "@/components/ui/separator"
import {
  useProvinces,
  useCities,
  useDistricts,
  useVillages,
} from "@/hooks/pengaturan/use-regions"
import { useWarehouseUsers } from "@/hooks/pengaturan/use-warehouse-users"
import type { LocationFormValues } from "@/lib/pengaturan/location-schema"
import type { RegionOption } from "@/types/pengaturan/location"

import { LocationMapPicker } from "./location-map-picker"

function toOptions(items: RegionOption[] | undefined) {
  return (items ?? []).map((r) => ({ value: r.id, label: r.nama }))
}

function Req() {
  return <span className="text-destructive"> *</span>
}

export function InformasiTab({ disabled = false }: { disabled?: boolean }) {
  const form = useFormContext<LocationFormValues>()

  const provinceId = form.watch("provinceId")
  const cityId = form.watch("cityId")
  const districtId = form.watch("districtId")

  const provinces = useProvinces()
  const cities = useCities(provinceId || undefined)
  const districts = useDistricts(cityId || undefined)
  const villages = useVillages(districtId || undefined)
  const users = useWarehouseUsers()

  return (
    <div className="space-y-6">
      {/* Informasi dasar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="locationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lokasi<Req /></FormLabel>
              <FormControl>
                <Input placeholder="Nama lokasi" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Lokasi<Req /></FormLabel>
              <FormControl>
                <Input placeholder="Kode lokasi" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Alamat */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Alamat</h3>

        <FormField
          control={form.control}
          name="coordinate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pin Lokasi</FormLabel>
              <LocationMapPicker
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detail Alamat<Req /></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cth: Blok, Unit No, Patokan"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="provinceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provinsi<Req /></FormLabel>
                <Combobox
                  options={toOptions(provinces.data)}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v ?? "")
                    form.setValue("cityId", "")
                    form.setValue("districtId", "")
                    form.setValue("villageId", "")
                  }}
                  placeholder="Pilih provinsi"
                  disabled={disabled || provinces.isLoading}
                  invalid={!!form.formState.errors.provinceId}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kota<Req /></FormLabel>
                <Combobox
                  options={toOptions(cities.data)}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v ?? "")
                    form.setValue("districtId", "")
                    form.setValue("villageId", "")
                  }}
                  placeholder="Pilih kota"
                  disabled={disabled || !provinceId || cities.isLoading}
                  invalid={!!form.formState.errors.cityId}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="districtId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kecamatan<Req /></FormLabel>
                <Combobox
                  options={toOptions(districts.data)}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v ?? "")
                    form.setValue("villageId", "")
                  }}
                  placeholder="Pilih kecamatan"
                  disabled={disabled || !cityId || districts.isLoading}
                  invalid={!!form.formState.errors.districtId}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="villageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kelurahan<Req /></FormLabel>
                <Combobox
                  options={toOptions(villages.data)}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih kelurahan"
                  disabled={disabled || !districtId || villages.isLoading}
                  invalid={!!form.formState.errors.villageId}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="postCode"
          render={({ field }) => (
            <FormItem className="sm:max-w-xs">
              <FormLabel>Kode Pos<Req /></FormLabel>
              <FormControl>
                <Input placeholder="Kode pos" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Kontak */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Kontak</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon<Req /></FormLabel>
                <FormControl>
                  <Input placeholder="+628xxxxx" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email<Req /></FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@contoh.com"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultWarehouseUser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Staff</FormLabel>
                <Combobox
                  options={(users.data ?? []).map((u) => ({
                    value: u.email,
                    label: u.name,
                    hint: u.email,
                  }))}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih staff"
                  disabled={disabled || users.isLoading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Opsi */}
      <div className="flex flex-wrap gap-6">
        <FormField
          control={form.control}
          name="isWarehouse"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormLabel className="!mt-0">Gudang</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPos"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormLabel className="!mt-0">POS / Outlet</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormLabel className="!mt-0">Aktif</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
