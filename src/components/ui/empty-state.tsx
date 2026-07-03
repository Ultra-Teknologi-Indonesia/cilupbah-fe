import * as React from "react";
import { FileXIcon, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | null;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FileXIcon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="size-10 opacity-20" strokeWidth={1.5} />}
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
