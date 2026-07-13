"use client";

import * as React from "react";
import { CopyJsonButton } from "@/components/bantuan/copy-json-button";
import { cn } from "@/lib/utils";

interface JsonBlockProps {
  data: unknown;
  label?: string;
  copyLabel?: string;
  className?: string;
  maxHeight?: number;
}

export function JsonBlock({ data, label, copyLabel = "Copy", className, maxHeight = 480 }: JsonBlockProps) {
  const text = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || copyLabel) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
          <CopyJsonButton data={data} label={copyLabel} />
        </div>
      )}
      <pre
        className="overflow-auto rounded-xl bg-muted p-4 text-xs font-mono leading-relaxed"
        style={{ maxHeight }}
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
