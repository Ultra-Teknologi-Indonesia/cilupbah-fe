import { Badge } from "@/components/ui/badge";
import { getStatusMeta, type Domain } from "@/lib/status";

export function StatusBadge({
  domain,
  status,
  className,
}: {
  domain: Domain;
  status: string | null | undefined;
  className?: string;
}) {
  const meta = getStatusMeta(domain, status);
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
