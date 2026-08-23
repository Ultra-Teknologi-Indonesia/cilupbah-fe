"use client";

import { FormSkeleton } from "@/components/ui/page-skeleton";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckIcon,
  DicesIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { LocationMultiCombobox } from "@/components/dashboard/laporan/shared/location-multi-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionMatrix } from "@/components/dashboard/pengaturan/permission-matrix";
import {
  useRoles,
  useCreateUser,
  useUpdateUser,
  useUserDetail,
} from "@/hooks/pengaturan/use-users";
import { usePermissionCatalog } from "@/hooks/pengaturan/use-permission-catalog";
import type { UserFormPayload } from "@/types/pengaturan/user";
import { apiError } from "@/lib/toast";

const PASSWORD_RULES = [
  {
    key: "length",
    label: "Minimal 8 karakter",
    test: (v: string) => v.length >= 8,
  },
  {
    key: "upper",
    label: "Huruf besar (A-Z)",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    key: "lower",
    label: "Huruf kecil (a-z)",
    test: (v: string) => /[a-z]/.test(v),
  },
  { key: "number", label: "Angka (0-9)", test: (v: string) => /\d/.test(v) },
  {
    key: "special",
    label: "Karakter spesial (!@#$...)",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

function getPasswordStrength(password: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1)
    return { level: "Lemah", color: "bg-destructive", percent: 20 };
  if (passed <= 2)
    return { level: "Lemah", color: "bg-destructive", percent: 40 };
  if (passed <= 3)
    return { level: "Sedang", color: "bg-warning", percent: 60 };
  if (passed <= 4)
    return { level: "Kuat", color: "bg-success", percent: 80 };
  return { level: "Sangat Kuat", color: "bg-success", percent: 100 };
}

const baseSchema = z.object({
  name: z.string().min(1, "Nama pengguna wajib diisi"),
  email: z.string().email({ message: "Format email tidak valid" }),
  nik: z.string().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "Pilih minimal satu peran"),
  location_ids: z.array(z.string()),
});

const createSchema = baseSchema
  .extend({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, { message: "Harus mengandung huruf besar" })
      .regex(/[a-z]/, { message: "Harus mengandung huruf kecil" })
      .regex(/\d/, { message: "Harus mengandung angka" })
      .regex(/[^A-Za-z0-9]/, { message: "Harus mengandung karakter spesial" }),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

const editSchema = baseSchema
  .extend({
    password: z
      .string()
      .refine(
        (v) =>
          !v ||
          (v.length >= 8 &&
            /[A-Z]/.test(v) &&
            /[a-z]/.test(v) &&
            /\d/.test(v) &&
            /[^A-Za-z0-9]/.test(v)),
        "Password harus minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter spesial",
      )
      .optional()
      .or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.password || d.password === d.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

type FormValues = {
  name: string;
  email: string;
  nik?: string;
  roles: string[];
  location_ids: string[];
  password: string;
  password_confirmation: string;
};

function generatePassword(length = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+-=";
  const all = upper + lower + digits + special;

  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = required.length; i < length; i++) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join("");
}

interface UserFormPageProps {
  userId?: string;
}

export function UserFormPage({ userId }: UserFormPageProps) {
  const router = useRouter();
  const isEdit = !!userId;

  const { data: user, isLoading: userLoading } = useUserDetail(userId ?? "");
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: catalog } = usePermissionCatalog();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [activeTab, setActiveTab] = React.useState("informasi");
  const [directPerms, setDirectPerms] = React.useState<string[]>([]);

  const isOwnerUser = (user?.roles ?? []).includes("owner");

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as unknown as import("react-hook-form").Resolver<FormValues>,
    defaultValues: {
      name: "",
      email: "",
      nik: "",
      password: "",
      password_confirmation: "",
      roles: [],
      location_ids: [],
    },
    values:
      user && isEdit
        ? {
            name: user.name,
            email: user.email,
            nik: user.nik ?? "",
            password: "",
            password_confirmation: "",
            roles: user.roles.filter((r) => r !== "owner"),
            location_ids: user.locations.map((l) => l.locationId),
          }
        : undefined,
  });

  React.useEffect(() => {
    if (user && isEdit) {
      setDirectPerms(user.directPermissions ?? []);
    }
  }, [user, isEdit]);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const passwordValue = form.watch("password") ?? "";
  const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

  const isPending = createUser.isPending || updateUser.isPending;

  function onSubmit(values: FormValues) {
    const payload: UserFormPayload = {
      name: values.name,
      email: values.email,
      roles: values.roles,
      nik: values.nik || null,
    };
    if (values.password) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }
    if (!isOwnerUser) {
      payload.permissions = directPerms;
      payload.location_ids = values.location_ids;
    }

    if (isEdit && userId) {
      updateUser.mutate(
        { id: userId, payload },
        {
          onSuccess: () => {
            toast.success("Pengguna berhasil diperbarui.");
            router.push(`/dashboard/pengaturan/pengguna/${userId}`);
          },
          onError: (err) => apiError(err, "Gagal memperbarui pengguna."),
        },
      );
    } else {
      createUser.mutate(payload, {
        onSuccess: () => {
          toast.success("Pengguna berhasil ditambahkan.");
          router.push("/dashboard/pengaturan/pengguna");
        },
        onError: (err) => apiError(err, "Gagal menambahkan pengguna."),
      });
    }
  }

  const selectedRoles = form.watch("roles");
  const rolePermsBaseline = React.useMemo(() => {
    const chosen = new Set(selectedRoles ?? []);
    const set = new Set<string>();
    for (const r of roles ?? []) {
      if (chosen.has(r.name)) (r.permissions ?? []).forEach((p) => set.add(p));
    }
    return [...set];
  }, [roles, selectedRoles]);

  if (isEdit && userLoading) {
    return (
      <FormSkeleton />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList
                  variant="line"
                  className="mb-5 w-full justify-start border-b"
                >
                  <TabsTrigger value="informasi">Informasi Pengguna</TabsTrigger>
                  <TabsTrigger value="hak-akses">Hak Akses</TabsTrigger>
                </TabsList>

                <TabsContent value="informasi" className="mt-0">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Pengguna{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
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
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK</FormLabel>
                      <FormControl>
                        <Input placeholder="Nomor Induk Karyawan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roles"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Peran Pengguna{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Combobox
                        multiple
                        value={selectedRoles}
                        onChange={(vals) =>
                          form.setValue("roles", vals, { shouldValidate: true })
                        }
                        options={(roles ?? []).map((r) => ({
                          value: r.name,
                          label: r.name,
                        }))}
                        placeholder={
                          rolesLoading ? "Memuat peran…" : "Pilih peran…"
                        }
                        searchPlaceholder="Cari peran…"
                        emptyText="Peran tidak ditemukan."
                        disabled={rolesLoading}
                        maxVisible={2}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isOwnerUser && (
                  <FormField
                    control={form.control}
                    name="location_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gudang</FormLabel>
                        <LocationMultiCombobox
                          value={field.value ?? []}
                          onChange={(vals) =>
                            form.setValue("location_ids", vals, {
                              shouldValidate: true,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Kosongkan untuk memberi akses ke semua gudang.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password{" "}
                        {!isEdit && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={
                              isEdit
                                ? "Kosongkan jika tidak diubah"
                                : "Masukkan password"
                            }
                            className="pr-24"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1.5">
                            <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="size-7 rounded-md text-muted-foreground"
                              onClick={() => setShowPassword((v) => !v)}
                            >
                              {showPassword ? (
                                <EyeOffIcon className="size-3.5" />
                              ) : (
                                <EyeIcon className="size-3.5" />
                              )}
                            </Button>
                            <Button type="button" variant="ghost" size="icon" aria-label="Buat kata sandi otomatis" className="size-7 rounded-md text-muted-foreground"
                              onClick={async () => {
                                const pwd = generatePassword();
                                form.setValue("password", pwd, {
                                  shouldValidate: true,
                                });
                                form.setValue("password_confirmation", pwd, {
                                  shouldValidate: true,
                                });
                                setShowPassword(true);
                                try {
                                  await navigator.clipboard.writeText(pwd);
                                  toast.success(
                                    "Password di-generate dan disalin ke clipboard.",
                                  );
                                } catch {
                                  toast.success(
                                    "Password berhasil di-generate.",
                                  );
                                }
                              }}
                            >
                              <DicesIcon className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {passwordValue && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full transition-all ${strength?.color}`}
                                style={{ width: `${strength?.percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {strength?.level}
                            </span>
                          </div>
                          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {PASSWORD_RULES.map((rule) => {
                              const ok = rule.test(passwordValue);
                              return (
                                <li
                                  key={rule.key}
                                  className="flex items-center gap-1.5 text-xs"
                                >
                                  {ok ? (
                                    <CheckIcon className="size-3 text-success" />
                                  ) : (
                                    <XIcon className="size-3 text-muted-foreground" />
                                  )}
                                  <span
                                    className={
                                      ok
                                        ? "text-success"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {rule.label}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Konfirmasi Password{" "}
                        {!isEdit && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Ulangi password"
                            className="pr-10"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                            <Button type="button" variant="ghost" size="icon" aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="size-7 rounded-md text-muted-foreground"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="size-3.5" />
                              ) : (
                                <EyeIcon className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                </TabsContent>

                <TabsContent value="hak-akses" className="mt-0">
                  {isOwnerUser ? (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                      Pengguna owner memiliki akses penuh dan tidak dapat diatur
                      per hak akses.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Centang abu-abu otomatis mengikuti peran yang dipilih dan
                        diatur di halaman Peran. Tambahkan centang lain untuk
                        memberi hak akses khusus di luar peran.
                      </p>
                      {catalog ? (
                        <PermissionMatrix
                          catalog={catalog}
                          value={directPerms}
                          onChange={setDirectPerms}
                          baseline={rolePermsBaseline}
                        />
                      ) : (
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                          <Loader2Icon className="size-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  {isEdit ? "Simpan" : "Tambah"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </LiquidGlass>
    </div>
  );
}
