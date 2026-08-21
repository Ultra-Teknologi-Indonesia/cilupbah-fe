import { Badge } from "@/components/ui/badge";
import { getStatusMeta, type Domain } from "@/lib/status";

export function StatusBadge({
  domain,
  status,
  label,
  className,
}: {
  domain: Domain;
  status: string | null | undefined;
  label?: string | null;
  className?: string;
}) {
  const meta = getStatusMeta(domain, status);
  return (
    <Badge variant={meta.variant} className={className}>
      {label || meta.label}
    </Badge>
  );
}
