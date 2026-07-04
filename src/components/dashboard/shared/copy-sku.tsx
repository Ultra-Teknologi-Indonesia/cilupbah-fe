"use client";

import { useCallback, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CopySkuProps {
  sku: string;
  className?: string;
}

export function CopySku({ sku, className }: CopySkuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(sku);
      toast.success("SKU disalin ke clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    [sku],
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "group/sku inline-flex items-center gap-1 rounded px-1 -mx-1 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className,
          )}
          aria-label="Salin SKU"
        >
          <span className="font-mono text-[11px] text-foreground">{sku}</span>
          {copied ? (
            <CheckIcon className="h-3 w-3 shrink-0 text-emerald-600" />
          ) : (
            <CopyIcon className="h-3 w-3 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity group-hover/sku:opacity-100" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? "Tersalin" : "Salin SKU"}
      </TooltipContent>
    </Tooltip>
  );
}
