"use client"

import * as React from "react"

function formatDuration(ms: number): string {
  if (ms <= 0) return "00:00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

export function CountdownTimer({
  startTime,
  endTime,
}: {
  startTime: string | null
  endTime: string | null
}) {
  const [now, setNow] = React.useState(() => Date.now())

  const end = endTime ? new Date(endTime).getTime() : null
  const start = startTime ? new Date(startTime).getTime() : null
  const isActive = start !== null && start <= now && (end === null || end > now)

  React.useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isActive])

  if (!startTime) {
    return <span className="text-muted-foreground">—</span>
  }

  if (end !== null && end <= now) {
    return (
      <span className="text-xs font-medium text-muted-foreground">Selesai</span>
    )
  }

  if (!isActive) {
    return <span className="text-muted-foreground">—</span>
  }

  const remaining = (end ?? now) - now

  return (
    <span className="font-mono text-sm font-medium tabular-nums text-primary">
      {formatDuration(remaining)}
    </span>
  )
}
