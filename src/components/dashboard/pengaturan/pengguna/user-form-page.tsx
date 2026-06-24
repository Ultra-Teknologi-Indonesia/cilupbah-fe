"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckIcon, ChevronDownIcon, CopyIcon, DicesIcon, EyeIcon, EyeOffIcon, Loader2Icon, XIcon } from "lucide-react"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

type FormValues = {
  name: string
  email: string
  nik?: string
  roles: string[]
  password: string
  password_confirmation: string
}

function generatePassword(length = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const special = "!@#$%^&*()_+-="
  const all = upper + lower + digits + special

  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ]

  for (let i = required.length; i < length; i++) {
    required.push(all[Math.floor(Math.random() * all.length)])
  }

  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[required[i], required[j]] = [required[j], required[i]]
  }

  return required.join("")
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEdit ? editSchema : createSchema) as any,
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

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                  render={() => {
                    const MAX_VISIBLE = 2
                    const visibleRoles = selectedRoles.slice(0, MAX_VISIBLE)
                    const hiddenCount = selectedRoles.length - MAX_VISIBLE
                    return (
                      <FormItem>
                        <FormLabel>
                          Peran Pengguna <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="flex h-9 w-full items-center justify-between gap-1.5 rounded-full border border-transparent bg-background px-3 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={rolesLoading}
                            >
                              {selectedRoles.length > 0 ? (
                                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                                  {visibleRoles.map((roleName) => (
                                    <Badge
                                      key={roleName}
                                      variant="secondary"
                                      className="shrink-0 gap-1 capitalize"
                                    >
                                      {roleName}
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          e.preventDefault()
                                          handleRemoveRole(roleName)
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            handleRemoveRole(roleName)
                                          }
                                        }}
                                        className="ml-0.5 cursor-pointer rounded-full hover:bg-muted"
                                      >
                                        <XIcon className="size-3" />
                                      </span>
                                    </Badge>
                                  ))}
                                  {hiddenCount > 0 && (
                                    <Badge variant="outline" className="shrink-0">
                                      +{hiddenCount}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  {rolesLoading ? "Memuat peran…" : "Pilih peran…"}
                                </span>
                              )}
                              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-(--radix-popover-trigger-width) gap-0 p-1.5"
                          >
                            {availableRoles.length === 0 ? (
                              <p className="px-3 py-2 text-sm text-muted-foreground">
                                Semua peran telah dipilih
                              </p>
                            ) : (
                              availableRoles.map((role) => (
                                <button
                                  key={role.id}
                                  type="button"
                                  className="flex w-full cursor-default items-center rounded-full px-3 py-2 text-sm font-medium capitalize outline-hidden hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => handleAddRole(role.name)}
                                >
                                  {role.name}
                                </button>
                              ))
                            )}
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password {!isEdit && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                            className="pr-24"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-1.5">
                            <button
                              type="button"
                              tabIndex={-1}
                              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              onClick={() => setShowPassword((v) => !v)}
                            >
                              {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                            </button>
                            <button
                              type="button"
                              tabIndex={-1}
                              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              onClick={async () => {
                                const pwd = generatePassword()
                                form.setValue("password", pwd, { shouldValidate: true })
                                form.setValue("password_confirmation", pwd, { shouldValidate: true })
                                setShowPassword(true)
                                try {
                                  await navigator.clipboard.writeText(pwd)
                                  toast.success("Password di-generate dan disalin ke clipboard.")
                                } catch {
                                  toast.success("Password berhasil di-generate.")
                                }
                              }}
                            >
                              <DicesIcon className="size-3.5" />
                            </button>
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
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Ulangi password"
                            className="pr-10"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                            <button
                              type="button"
                              tabIndex={-1}
                              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                            >
                              {showConfirmPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                            </button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
