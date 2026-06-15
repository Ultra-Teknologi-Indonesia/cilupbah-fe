const pulse = "animate-pulse rounded bg-muted motion-reduce:animate-none"

export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className={`size-14 rounded-xl ${pulse}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-5 w-48 ${pulse}`} />
          <div className={`h-3 w-32 ${pulse}`} />
        </div>
        <div className={`h-9 w-24 ${pulse}`} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-16 ${pulse}`} />
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border/60 p-5">
          <div className={`h-4 w-32 ${pulse}`} />
          <div className={`h-20 w-full ${pulse}`} />
        </div>
      ))}
    </div>
  )
}
