"use client"

import { useEffect } from "react"

export function PhantomProvider() {
  useEffect(() => {
    import("@aejkatappaja/phantom-ui")
  }, [])
  return null
}
