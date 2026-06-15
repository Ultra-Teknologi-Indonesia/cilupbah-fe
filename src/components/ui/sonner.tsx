"use client"

import { Toaster as Sonner, toast, type ToasterProps, type ExternalToast } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
        ),
        info: <InfoIcon className="size-4 text-primary" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
        ),
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          // Liquid glass: latar translusen (popover 65%) + diblur lewat class.
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "transparent",
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10 backdrop-blur-xl backdrop-saturate-150",
          title: "text-sm font-semibold",
          description: "text-sm opacity-90",
          icon: "flex items-center",
          content: "gap-0.5",
          actionButton:
            "bg-primary! text-primary-foreground! rounded-full! px-3! text-xs! font-medium!",
          cancelButton:
            "bg-muted! text-muted-foreground! rounded-full! px-3! text-xs! font-medium! hover:bg-muted/70!",
          closeButton:
            "bg-background/80! text-foreground! border-border! backdrop-blur! hover:bg-muted!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
export type { ExternalToast }
