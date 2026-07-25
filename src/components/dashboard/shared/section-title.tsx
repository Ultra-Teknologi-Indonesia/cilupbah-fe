import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h3 className={cn("text-sm font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}
