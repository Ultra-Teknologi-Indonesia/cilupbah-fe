"use client"

import * as React from "react"
import { CheckCircle2Icon, AlertCircleIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type SectionStatus = "valid" | "error" | "empty"

export interface SectionItem {
  id: string
  label: string
  status: SectionStatus
}

export function SectionNav({ sections }: { sections: SectionItem[] }) {
  const [active, setActive] = React.useState(sections[0]?.id)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  const completed = sections.filter((s) => s.status === "valid").length

  return (
    <nav className="flex flex-col gap-1">
      <div className="mb-2 px-3">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progres</span>
          <span className="tabular-nums">
            {completed}/{sections.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${(completed / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {sections.map((s) => {
        const isActive = active === s.id
        const Icon =
          s.status === "valid"
            ? CheckCircle2Icon
            : s.status === "error"
              ? AlertCircleIcon
              : CircleIcon
        return (
          <button
            key={s.id}
            type="button"
            onClick={() =>
              document
                .getElementById(s.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
              isActive
                ? "bg-brand/10 font-medium text-brand"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                s.status === "valid" && "text-emerald-600 dark:text-emerald-400",
                s.status === "error" && "text-destructive",
                s.status === "empty" && "text-muted-foreground/50"
              )}
            />
            <span className="truncate">{s.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
