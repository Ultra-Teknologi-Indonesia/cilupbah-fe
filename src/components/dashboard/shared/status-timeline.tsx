"use client";

import * as React from "react";
import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getStatusMeta, type Domain } from "@/lib/status";

interface StatusTimelineProps {
  domain: Domain;
  steps: string[];
  currentStatus: string;
  cancelStatuses?: string[];
  className?: string;
}

export function StatusTimeline({
  domain,
  steps,
  currentStatus,
  cancelStatuses = ["CANCELLED", "FAILED"],
  className,
}: StatusTimelineProps) {
  const isCancelled = cancelStatuses.includes(currentStatus);
  const currentIndex = isCancelled ? -1 : steps.indexOf(currentStatus);

  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-3 sm:gap-4",
        className,
      )}
      aria-label="Timeline status"
    >
      {steps.map((step, i) => {
        const meta = getStatusMeta(domain, step);
        const isDone = !isCancelled && currentIndex > i;
        const isActive = !isCancelled && currentIndex === i;
        const isPending = !isCancelled && currentIndex < i;

        return (
          <li
            key={step}
            className="flex items-center gap-2"
            aria-current={isActive ? "step" : undefined}
          >
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                isDone && "border-primary bg-primary text-primary-foreground",
                isActive &&
                  "border-primary bg-primary/10 text-primary ring-2 ring-primary/30",
                isPending &&
                  "border-border bg-muted text-muted-foreground",
              )}
            >
              {isDone ? <CheckIcon className="size-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs sm:text-sm",
                (isDone || isActive)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {meta.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "hidden h-px w-8 sm:block",
                  isDone ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
      {isCancelled && (
        <li className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full border border-destructive bg-destructive/10 text-destructive">
            <XIcon className="size-3.5" />
          </div>
          <span className="text-xs font-medium text-destructive sm:text-sm">
            {getStatusMeta(domain, currentStatus).label}
          </span>
        </li>
      )}
    </ol>
  );
}
