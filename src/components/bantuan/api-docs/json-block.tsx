"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface JsonBlockProps {
  data: unknown;
  label?: string;
  className?: string;
  maxHeight?: number;
}

export function JsonBlock({ data, label, className, maxHeight = 480 }: JsonBlockProps) {
  const text = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
      <pre
        className="overflow-auto rounded-xl bg-muted p-4 font-mono text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
