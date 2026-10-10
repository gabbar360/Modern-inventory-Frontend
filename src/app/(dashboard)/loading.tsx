export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-md" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-7 w-32 bg-muted/80 rounded" />
            <div className="h-3 w-20 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="h-12 border-b border-border bg-muted/20 px-4 flex items-center gap-4">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded ml-auto" />
        </div>
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="space-y-1">
                  <div className="h-4 w-36 bg-muted/80 rounded" />
                  <div className="h-3 w-24 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
