"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Building2,
  Camera,
  Clock3,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { InfoField } from "@/components/dashboard/shared/info-field";
import { useMe } from "@/hooks/auth/use-auth";
import { useUpdateProfile } from "@/hooks/auth/use-profile";
import { formatDateTimeFull, getInitials } from "@/lib/format";
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/schemas/auth/update-profile.schema";

import { AvatarUploader } from "../avatar-uploader";

export function ProfilTab() {
  const meQuery = useMe();
  const me = meQuery.data;
  const [uploaderOpen, setUploaderOpen] = React.useState(false);

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", nik: "", phone: "" },
    mode: "onTouched",
  });

  React.useEffect(() => {
    if (!me) return;
    form.reset({
      name: me.name ?? "",
      nik: me.nik ?? "",
      phone: me.phone ?? "",
    });
  }, [me, form]);

  const updateProfile = useUpdateProfile();

  const onSubmit = (values: UpdateProfileValues) => {
    updateProfile.mutate(
      {
        name: values.name.trim(),
        nik: values.nik ? values.nik.trim() : null,
        phone: values.phone ? values.phone.trim() : null,
      },
      { onSuccess: () => form.reset(form.getValues()) },
    );
  };

  const initials = getInitials(me?.name ?? "");
  const locations = me?.locations ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>Terlihat di header dan navigasi.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-2">
          <Avatar className="size-28">
            <AvatarImage src={me?.avatar_url ?? ""} alt={me?.name ?? ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            onClick={() => setUploaderOpen(true)}
          >
            <Camera className="size-4" />
            {me?.avatar_url ? "Ganti foto" : "Unggah foto"}
          </Button>
          <p className="text-xs text-muted-foreground">
            PNG atau JPG · maksimal 2MB
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
            noValidate
          >
            <CardHeader>
              <CardTitle>Data Pribadi</CardTitle>
              <CardDescription>
                Nama akan muncul pada aktivitas dan riwayat.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nama lengkap</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="md:col-span-1">
                <FormLabel>Email</FormLabel>
                <Input
                  value={me?.email ?? ""}
                  readOnly
                  disabled
                  aria-readonly
                />
                <FormDescription>
                  Hubungi administrator untuk mengubah email.
                </FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>NIK</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nomor Induk Kependudukan"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nomor telepon</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        invalid={!!form.formState.errors.phone}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <div className="flex items-center justify-end gap-2 px-6 pb-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.reset()}
                disabled={updateProfile.isPending || !form.formState.isDirty}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateProfile.isPending || !form.formState.isDirty}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Info Akun</CardTitle>
          <CardDescription>
            Informasi yang dikelola oleh administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoField
            label="Peran"
            icon={ShieldCheck}
            value={
              me?.roles?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {me.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="capitalize"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
          <InfoField
            label="Gudang default"
            icon={Building2}
            value={me?.warehouse_id ?? "—"}
          />
          <InfoField
            label="Lokasi yang diakses"
            icon={MapPin}
            value={
              locations.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {locations.map((loc) => (
                    <Badge key={loc.location_id} variant="outline">
                      {loc.location_name}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
          <InfoField
            label="Terakhir login"
            icon={Clock3}
            value={
              me?.last_login_at ? formatDateTimeFull(me.last_login_at) : "—"
            }
          />
          <InfoField
            label="Total hak akses"
            icon={Info}
            value={me?.permissions?.length ?? 0}
          />
        </CardContent>
      </Card>

      <AvatarUploader
        open={uploaderOpen}
        onOpenChange={setUploaderOpen}
        currentUrl={me?.avatar_url}
        currentName={me?.name}
        hasAvatar={Boolean(me?.avatar_url)}
      />
    </div>
  );
}
