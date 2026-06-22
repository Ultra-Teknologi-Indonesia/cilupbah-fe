"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2Icon, CheckCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryRulesCard } from "@/components/dashboard/master-produk/upload-to-channel/category-rules-card"
import { Combobox } from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequiredAttributes } from "@/hooks/master-produk/use-upload"

interface AttributeSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  shopId: string
  onConfirm: (attributeMapping: Record<string, string>) => void
  isUploading?: boolean
}

export function AttributeSelectionDialog({
  open,
  onOpenChange,
  productId,
  shopId,
  onConfirm,
  isUploading,
}: AttributeSelectionDialogProps) {
  const { data, isLoading, isError, error, refetch } = useRequiredAttributes(
    productId,
    open ? shopId : null
  )

  const [selections, setSelections] = React.useState<Record<string, string>>({})

  const uncoveredAttrs = React.useMemo(
    () => (data?.attributes ?? []).filter((a) => !a.isCovered),
    [data]
  )

  const coveredAttrs = React.useMemo(
    () => (data?.attributes ?? []).filter((a) => a.isCovered),
    [data]
  )

  React.useEffect(() => {
    if (!open) {
      setSelections({})
    }
  }, [open])

  React.useEffect(() => {
    if (!data || isLoading) return
    if (uncoveredAttrs.length === 0) {
      onConfirm({})
    }
  }, [data, isLoading, uncoveredAttrs.length, onConfirm])

  const allFilled = uncoveredAttrs.every((a) => !!selections[a.externalId])

  const handleConfirm = () => {
    onConfirm(selections)
  }

  if (!open || (data && uncoveredAttrs.length === 0)) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Atribut TikTok yang Diperlukan</DialogTitle>
          <DialogDescription>
            Pilih nilai untuk atribut wajib sebelum upload ke TikTok Shop.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-6 text-center">
            <p className="text-sm text-destructive font-medium">
              {(error as { message?: string })?.message || "Gagal memuat atribut."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              asChild
            >
              <Link href="/dashboard/kategori-merek/kategori">
                Petakan Kategori
              </Link>
            </Button>
          </div>
        )}

        {data && !isLoading && !isError && (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 pr-3">
              {data.rules && <CategoryRulesCard rules={data.rules} />}

              {uncoveredAttrs.map((attr) => (
                <div key={attr.externalId} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    {attr.name}
                    <Badge variant="destructive" className="text-[10px] font-normal px-1.5 py-0">
                      Wajib
                    </Badge>
                  </label>
                  <Combobox
                    options={attr.options.map((o) => ({
                      value: o.externalId,
                      label: o.name,
                    }))}
                    value={selections[attr.externalId] ?? null}
                    onChange={(val) =>
                      setSelections((prev) => ({
                        ...prev,
                        [attr.externalId]: val ?? "",
                      }))
                    }
                    placeholder={`Pilih ${attr.name}`}
                  />
                </div>
              ))}

              {coveredAttrs.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sudah terisi dari spesifikasi
                  </p>
                  {coveredAttrs.map((attr) => (
                    <div
                      key={attr.externalId}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircleIcon className="size-4 text-emerald-500" />
                      <span>{attr.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {!isError && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!allFilled || isLoading || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Mengupload…
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
