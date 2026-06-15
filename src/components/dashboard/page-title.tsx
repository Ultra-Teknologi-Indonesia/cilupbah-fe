import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbEntry {
  label: string
  href?: string
}

interface PageTitleProps {
  title: string
  description?: string

  breadcrumb?: BreadcrumbEntry[]

  actions?: React.ReactNode
  className?: string
}

export function PageTitle({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageTitleProps) {
  return (
    <LiquidGlass
      radius={24}
      intensity="default"
      className={cn("bg-white/40 dark:bg-white/[0.06]", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <Breadcrumb className="mb-1.5">
              <BreadcrumbList>
                {breadcrumb.map((item, i) => {
                  const isLast = i === breadcrumb.length - 1
                  return (
                    <React.Fragment key={`${item.label}-${i}`}>
                      <BreadcrumbItem>
                        {item.href && !isLast ? (
                          <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </LiquidGlass>
  )
}
