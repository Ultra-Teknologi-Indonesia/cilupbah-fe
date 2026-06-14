import { Badge } from "@/components/ui/badge"
import type { ProductStatus } from "../_data/mock-products"

const MAP: Record<
  ProductStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  master: { label: "Master", variant: "success" },
  in_review: { label: "Review", variant: "warning" },
  download: { label: "Draf", variant: "muted" },
  archived: { label: "Diarsip", variant: "outline" },
}

export const PRODUCT_STATUS_OPTIONS = (
  Object.keys(MAP) as ProductStatus[]
).map((value) => ({ value, label: MAP[value].label }))

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus
  className?: string
}) {
  const { label, variant } = MAP[status]
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
