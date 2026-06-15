import type { ProductStatus } from "@/types/master-produk"

type StatusBadgeVariant = "success" | "warning" | "muted" | "outline"

/** Label & varian badge per status produk (sumber tunggal). */
export const PRODUCT_STATUS_META: Record<
  ProductStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  master: { label: "Master", variant: "success" },
  in_review: { label: "Review", variant: "warning" },
  download: { label: "Draf", variant: "muted" },
  archived: { label: "Diarsip", variant: "outline" },
}

/** Opsi status untuk faceted filter. */
export const PRODUCT_STATUS_OPTIONS = (
  Object.keys(PRODUCT_STATUS_META) as ProductStatus[]
).map((value) => ({ value, label: PRODUCT_STATUS_META[value].label }))

/** Warna chip per channel marketplace. */
export const CHANNEL_COLORS: Record<string, string> = {
  shopee: "bg-orange-500",
  tokopedia: "bg-green-600",
  tiktok: "bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-900",
  lazada: "bg-blue-600",
}
