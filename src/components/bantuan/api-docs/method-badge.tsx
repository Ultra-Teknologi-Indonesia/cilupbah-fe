import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  GET: "bg-primary/10 text-primary border-primary/20",
  POST: "bg-success/10 text-success border-success/20",
  PUT: "bg-warning/10 text-warning border-warning/20",
  PATCH: "bg-warning/10 text-warning border-warning/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
};

export function MethodBadge({
  method,
  className,
}: {
  method: string;
  className?: string;
}) {
  const style =
    MAP[method.toUpperCase()] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide",
        style,
        className,
      )}
    >
      {method}
    </span>
  );
}
