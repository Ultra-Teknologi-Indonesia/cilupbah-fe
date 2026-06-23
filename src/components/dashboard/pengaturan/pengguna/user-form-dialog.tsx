"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2Icon, XIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { User, UserFormPayload } from "@/types/pengaturan/user"

const AVAILABLE_ROLES = [
  { id: 1, name: "Administrator" },
  { id: 3, name: "Finance" },
  { id: 4, name: "Warehouse" },
  { id: 11, name: "Store Manager" },
] as const

const userFormSchema = z.object({
  full_name: z.string().min(1, "Nama pengguna wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional(),
  role_ids: z.array(z.number()).min(1, "Pilih minimal satu peran"),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  loading?: boolean
  onSubmit: (payload: UserFormPayload) => void
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  loading,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = !!user

  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      isEdit
        ? userFormSchema
        : userFormSchema.extend({
            password: z.string().min(6, "Password minimal 6 karakter"),
          })
    ),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role_ids: [],
    },
  })

  React.useEffect(() => {
    if (open && user) {
      form.reset({
        full_name: user.fullName,
        email: user.email,
        password: "",
        role_ids: user.roles.map((r) => r.roleId),
      })
    } else if (open && !user) {
      form.reset({ full_name: "", email: "", password: "", role_ids: [] })
    }
  }, [open, user, form])

  function handleSubmit(values: UserFormValues) {
    onSubmit({
      full_name: values.full_name,
      email: values.email,
      password: values.password || undefined,
      role_ids: values.role_ids,
      location_ids: user?.locations.map((l) => l.locationId) ?? [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Pengguna <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama" {...field} />
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

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Peran Pengguna <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="space-y-2">
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((roleId) => {
                          const role = AVAILABLE_ROLES.find((r) => r.id === roleId)
                          return (
                            <Badge key={roleId} variant="secondary" className="gap-1">
                              {role?.name ?? `Role ${roleId}`}
                              <button
                                type="button"
                                onClick={() =>
                                  field.onChange(field.value.filter((id) => id !== roleId))
                                }
                                className="ml-0.5 rounded-full hover:bg-muted"
                              >
                                <XIcon className="size-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
                          Pilih peran…
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="start">
                        {AVAILABLE_ROLES.map((role) => (
                          <label
                            key={role.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            <Checkbox
                              checked={field.value.includes(role.id)}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, role.id]
                                    : field.value.filter((id) => id !== role.id)
                                )
                              }}
                            />
                            {role.name}
                          </label>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
