import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  backHref?: string
  sticky?: boolean
  className?: string
}

export function PageTitle({
  title,
  description,
  breadcrumb,
  actions,
  backHref,
  sticky,
  className,
}: PageTitleProps) {
  return (
    <div className={cn(sticky && "sticky top-0 z-30")}>
      <LiquidGlass
        radius={24}
        intensity="default"
        className={cn("bg-white/40 dark:bg-white/[0.06]", className)}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-start gap-3">
            {backHref && (
              <Button variant="outline" size="icon-sm" className="mt-0.5 shrink-0" asChild>
                <Link href={backHref} prefetch={false} aria-label="Kembali">
                  <ArrowLeftIcon className="size-4" />
                </Link>
              </Button>
            )}
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
                                <Link href={item.href} prefetch={false}>{item.label}</Link>
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
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </LiquidGlass>
    </div>
  )
}
