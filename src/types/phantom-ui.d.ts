import "react"

type PhantomUIAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    loading?: boolean
    animation?: "shimmer" | "pulse" | "breathe" | "solid"
    "shimmer-direction"?: "ltr" | "rtl" | "ttb" | "btt"
    "shimmer-color"?: string
    "background-color"?: string
    duration?: number
    stagger?: number
    reveal?: number
    count?: number
    "count-gap"?: number
    "fallback-radius"?: number
    debug?: boolean
    "loading-label"?: string
    "pierce-shadow"?: boolean
  },
  HTMLElement
>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUIAttributes
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUIAttributes
    }
  }
}
