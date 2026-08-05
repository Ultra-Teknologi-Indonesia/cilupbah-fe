import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/master-produk";
import { PRODUCT_STATUS_META } from "@/lib/master-produk/constants";

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  const meta = PRODUCT_STATUS_META[status] ?? {
    label: status,
    variant: "muted" as const,
  };
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
