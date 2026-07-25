import * as React from "react";

import { cn } from "@/lib/utils";

interface FormFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFooter({ children, className }: FormFooterProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
    >
      {children}
    </div>
  );
}
