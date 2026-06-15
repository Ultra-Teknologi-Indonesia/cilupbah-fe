import { Badge } from "@/components/ui/badge"
import type { ProductStatus } from "@/types/master-produk"
import { PRODUCT_STATUS_META } from "@/lib/master-produk/constants"

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus
  className?: string
}) {
  const { label, variant } = PRODUCT_STATUS_META[status]
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
