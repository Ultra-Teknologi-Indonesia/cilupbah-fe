import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap w-fit shrink-0 transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success:
          "border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-500/12 text-amber-700 dark:text-amber-400",
        destructive:
          "border-transparent bg-destructive/12 text-destructive",
        muted: "border-transparent bg-muted text-muted-foreground",
        info: "border-transparent bg-blue-500/12 text-blue-700 dark:text-blue-400",
        indigo: "border-transparent bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
        purple: "border-transparent bg-purple-500/12 text-purple-700 dark:text-purple-400",
        orange: "border-transparent bg-orange-500/12 text-orange-700 dark:text-orange-400",
        teal: "border-transparent bg-teal-500/12 text-teal-700 dark:text-teal-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
