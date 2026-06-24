"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon, CheckIcon, Loader2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useRoles,
  useCreateUser,
  useUpdateUser,
  useUserDetail,
} from "@/hooks/pengaturan/use-users"
import type { UserFormPayload } from "@/types/pengaturan/user"

const PASSWORD_RULES = [
  { key: "length", label: "Minimal 8 karakter", test: (v: string) => v.length >= 8 },
  { key: "upper", label: "Huruf besar (A-Z)", test: (v: string) => /[A-Z]/.test(v) },
  { key: "lower", label: "Huruf kecil (a-z)", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "Angka (0-9)", test: (v: string) => /\d/.test(v) },
  { key: "special", label: "Karakter spesial (!@#$...)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

function getPasswordStrength(password: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  if (passed <= 1) return { level: "Lemah", color: "bg-destructive", percent: 20 }
  if (passed <= 2) return { level: "Lemah", color: "bg-destructive", percent: 40 }
  if (passed <= 3) return { level: "Sedang", color: "bg-yellow-500", percent: 60 }
  if (passed <= 4) return { level: "Kuat", color: "bg-emerald-500", percent: 80 }
  return { level: "Sangat Kuat", color: "bg-emerald-600", percent: 100 }
}

const baseSchema = z.object({
  name: z.string().min(1, "Nama pengguna wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  nik: z.string().optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "Pilih minimal satu peran"),
})

const createSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung huruf besar")
    .regex(/[a-z]/, "Harus mengandung huruf kecil")
    .regex(/\d/, "Harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Harus mengandung karakter spesial"),
  password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"],
})

const editSchema = baseSchema.extend({
  password: z
    .string()
    .refine(
      (v) => !v || (v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v)),
      "Password harus minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter spesial"
    )
    .optional()
    .or(z.literal("")),
  password_confirmation: z.string().optional().or(z.literal("")),
}).refine((d) => !d.password || d.password === d.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"],
})

type FormValues = z.infer<typeof createSchema>

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === "string" && msg) return msg
  }
  return fallback
}

interface UserFormPageProps {
  userId?: string
}

export function UserFormPage({ userId }: UserFormPageProps) {
  const router = useRouter()
  const isEdit = !!userId

  const { data: user, isLoading: userLoading } = useUserDetail(userId ?? "")
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      name: "",
      email: "",
      nik: "",
      password: "",
      password_confirmation: "",
      roles: [],
    },
  })

  React.useEffect(() => {
    if (user && isEdit) {
      form.reset({
        name: user.name,
        email: user.email,
        nik: user.nik ?? "",
        password: "",
        password_confirmation: "",
        roles: user.roles.filter((r) => r !== "owner"),
      })
    }
  }, [user, isEdit, form])

  const passwordValue = form.watch("password") ?? ""
  const strength = passwordValue ? getPasswordStrength(passwordValue) : null

  const isPending = createUser.isPending || updateUser.isPending

  function onSubmit(values: FormValues) {
    const payload: UserFormPayload = {
      name: values.name,
      email: values.email,
      roles: values.roles,
      nik: values.nik || null,
    }
    if (values.password) {
      payload.password = values.password
      payload.password_confirmation = values.password_confirmation
    }

    if (isEdit && userId) {
      updateUser.mutate(
        { id: userId, payload },
        {
          onSuccess: () => {
            toast.success("Pengguna berhasil diperbarui.")
            router.push(`/dashboard/pengaturan/pengguna/${userId}`)
          },
          onError: (err) => toast.error(getErrorMessage(err, "Gagal memperbarui pengguna.")),
        }
      )
    } else {
      createUser.mutate(payload, {
        onSuccess: () => {
          toast.success("Pengguna berhasil ditambahkan.")
          router.push("/dashboard/pengaturan/pengguna")
        },
        onError: (err) => toast.error(getErrorMessage(err, "Gagal menambahkan pengguna.")),
      })
    }
  }

  if (isEdit && userLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" /> Memuat data pengguna…
      </div>
    )
  }

  function handleAddRole(roleName: string) {
    const current = form.getValues("roles")
    if (!current.includes(roleName)) {
      form.setValue("roles", [...current, roleName], { shouldValidate: true })
    }
  }

  function handleRemoveRole(roleName: string) {
    const current = form.getValues("roles")
    form.setValue("roles", current.filter((r) => r !== roleName), { shouldValidate: true })
  }

  const selectedRoles = form.watch("roles")
  const availableRoles = (roles ?? []).filter((r) => !selectedRoles.includes(r.name))

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} className="bg-white/40 dark:bg-white/[0.06]">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeftIcon className="mr-1 size-4" />
              Kembali
            </Button>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Pengguna" : "Tambah Pengguna"}
            </h2>
            <div className="w-20" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Pengguna <span className="text-destructive">*</span>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {!isEdit && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                        {...field}
                      />
                    </FormControl>
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
                            const ok = rule.test(passwordValue)
                            return (
                              <li key={rule.key} className="flex items-center gap-1.5 text-xs">
                                {ok ? (
                                  <CheckIcon className="size-3 text-emerald-500" />
                                ) : (
                                  <XIcon className="size-3 text-muted-foreground" />
                                )}
                                <span className={ok ? "text-emerald-600" : "text-muted-foreground"}>
                                  {rule.label}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Konfirmasi Password {!isEdit && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ulangi password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roles */}
              <FormField
                control={form.control}
                name="roles"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Peran Pengguna <span className="text-destructive">*</span>
                    </FormLabel>
                    {selectedRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRoles.map((roleName) => (
                          <Badge key={roleName} variant="secondary" className="gap-1 capitalize">
                            {roleName}
                            <button
                              type="button"
                              onClick={() => handleRemoveRole(roleName)}
                              className="ml-0.5 rounded-full hover:bg-muted"
                            >
                              <XIcon className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Select
                      value=""
                      onValueChange={handleAddRole}
                      disabled={rolesLoading || availableRoles.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            rolesLoading
                              ? "Memuat peran…"
                              : availableRoles.length === 0
                                ? "Semua peran telah dipilih"
                                : "Pilih peran…"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.name} className="capitalize">
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                  {isEdit ? "Simpan" : "Tambah"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </LiquidGlass>
    </div>
  )
}
