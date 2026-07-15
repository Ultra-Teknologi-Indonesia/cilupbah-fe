import { Badge } from "@/components/ui/badge";
import { SmartphoneIcon, CheckIcon } from "lucide-react";

interface AssignedBadgeProps {
  assignedToName: string | null;
  isUnlockedOnce: boolean;
}

export function AssignedBadge({
  assignedToName,
  isUnlockedOnce,
}: AssignedBadgeProps) {
  if (isUnlockedOnce) {
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckIcon className="size-3" />
        Selesai
      </Badge>
    );
  }

  if (!assignedToName) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Badge variant="outline" className="gap-1">
      <SmartphoneIcon className="size-3" />
      {assignedToName}
    </Badge>
  );
}
