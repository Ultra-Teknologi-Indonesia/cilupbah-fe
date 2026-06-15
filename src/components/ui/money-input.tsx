"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

export function MoneyInput({ id, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        Rp
      </span>
      <Input id={id} inputMode="numeric" className="pl-9" {...props} />
    </div>
  )
}
