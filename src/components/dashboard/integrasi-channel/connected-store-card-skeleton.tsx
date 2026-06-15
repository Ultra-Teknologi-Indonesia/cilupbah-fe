export function ConnectedStoreCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-9 flex-1 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="size-9 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      </div>
    </div>
  )
}
