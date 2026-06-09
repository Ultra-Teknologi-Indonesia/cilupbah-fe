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
      richColors
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm opacity-90",
          icon: "flex items-center",
          content: "gap-0.5",
          actionButton:
            "bg-primary! text-primary-foreground! rounded-full! px-3! text-xs! font-medium! hover:bg-primary/80!",
          cancelButton:
            "bg-muted! text-muted-foreground! rounded-full! px-3! text-xs! font-medium! hover:bg-muted/70!",
          closeButton:
            "bg-background! text-foreground! border-border! hover:bg-muted!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
export type { ExternalToast }
