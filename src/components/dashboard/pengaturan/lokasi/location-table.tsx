"use client"

import Link from "next/link"
import { LockIcon, Trash2Icon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Location } from "@/types/pengaturan/location"

interface LocationTableProps {
  locations: Location[]
  togglingId: string | null
  onToggleActive: (location: Location) => void
  onDelete: (location: Location) => void
}

export function LocationTable({
  locations,
  togglingId,
  onToggleActive,
  onDelete,
}: LocationTableProps) {
  return (
    <TooltipProvider>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Lokasi</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead className="w-28 text-center">Aktif</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((location) => {
          const locked = location.isSystem || location.isLocked
          // Pusat (is_system) tetap bisa diedit; Transit (is_locked) tidak.
          const editable = !location.isLocked
          const editHref = `/dashboard/pengaturan/lokasi/${location.id}/edit`

          return (
            <TableRow key={location.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {locked && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LockIcon className="size-4 shrink-0 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Lokasi sistem{location.isLocked ? " — tidak dapat diubah/dihapus" : " — tidak dapat dihapus"}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {editable ? (
                    <Link
                      href={editHref}
                      className="font-medium text-primary hover:underline"
                    >
                      {location.locationName}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      {location.locationName}
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {location.locationType ?? "Lokasi Sendiri"}
              </TableCell>

              <TableCell className="text-center">
                <Switch
                  checked={location.isActive}
                  disabled={locked || togglingId === location.id}
                  onCheckedChange={() => onToggleActive(location)}
                  aria-label={`Toggle aktif ${location.locationName}`}
                />
              </TableCell>

              <TableCell className="text-right">
                {!location.isSystem && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn("text-destructive hover:text-destructive")}
                    onClick={() => onDelete(location)}
                    aria-label={`Hapus ${location.locationName}`}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
    </TooltipProvider>
  )
}
