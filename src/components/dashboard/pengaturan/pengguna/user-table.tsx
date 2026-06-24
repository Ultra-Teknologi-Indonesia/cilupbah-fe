"use client"

import Link from "next/link"
import { Trash2Icon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { User } from "@/types/pengaturan/user"

function formatRoles(roles: string[]): string {
  if (roles.length === 0) return "-"
  const first = roles[0].charAt(0).toUpperCase() + roles[0].slice(1)
  if (roles.length === 1) return first
  return `${first} dan ${roles.length - 1} peran lainnya`
}

function formatDate(iso: string | null): string {
  if (!iso) return "-"
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return "-"
  }
}

interface UserTableProps {
  users: User[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  onDelete: (user: User) => void
}

export function UserTable({
  users,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onDelete,
}: UserTableProps) {
  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleAll}
              aria-label="Pilih semua"
            />
          </TableHead>
          <TableHead>Nama Pengguna</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Peran Pengguna</TableHead>
          <TableHead>Login Terakhir</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Checkbox
                checked={selectedIds.has(user.id)}
                onCheckedChange={() => onToggleSelect(user.id)}
                aria-label={`Pilih ${user.name}`}
              />
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/pengaturan/pengguna/${user.id}`}
                className="font-medium text-primary hover:underline"
              >
                {user.name || user.email}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell className="text-muted-foreground">{formatRoles(user.roles)}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(user.lastLoginAt)}</TableCell>
            <TableCell className="text-right">
              {!user.roles.includes("owner") && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(user)}
                  aria-label={`Hapus ${user.name}`}
                >
                  <Trash2Icon />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
