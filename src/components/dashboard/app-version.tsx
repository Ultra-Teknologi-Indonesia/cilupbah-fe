import { cn } from "@/lib/utils";

export function AppVersion({
  version,
  className,
}: {
  version: string;
  className?: string;
}) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      Cilupbah Superapps · {version}
    </p>
  );
}
