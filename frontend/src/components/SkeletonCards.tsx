export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="ps-card p-5 animate-skeleton"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full shrink-0" style={{ background: 'var(--ps-bg-elevated)' }} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full" style={{ background: 'var(--ps-bg-elevated)' }} />
                <div className="h-3 rounded w-20" style={{ background: 'var(--ps-bg-elevated)' }} />
              </div>
              <div className="h-4 rounded w-3/4" style={{ background: 'var(--ps-bg-elevated)' }} />
              <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
              <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.03)' }} />
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 rounded-full w-16" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="h-5 rounded-full w-14" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="h-5 rounded-full w-12" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-3 rounded w-10" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="h-3 rounded w-10" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="h-3 rounded w-16 ml-auto" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTrending({ count = 5 }: { count?: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded animate-skeleton" style={{ background: 'var(--ps-bg-elevated)' }} />
        <div className="h-5 rounded w-32 animate-skeleton" style={{ background: 'var(--ps-bg-elevated)' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="ps-card p-4 animate-skeleton"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full" style={{ background: 'var(--ps-bg-elevated)' }} />
              <div className="h-3 rounded w-16" style={{ background: 'var(--ps-bg-elevated)' }} />
            </div>
            <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--ps-bg-elevated)' }} />
            <div className="h-3 rounded w-full mb-1" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="ps-card" style={{ borderRadius: 'var(--ps-radius-card)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-skeleton" style={{ animationDelay: `${i * 60}ms`, borderBottom: i < count - 1 ? '1px solid var(--ps-border)' : 'none' }}>
          <div className="w-6 h-4 rounded" style={{ background: 'var(--ps-bg-elevated)' }} />
          <div className="w-7 h-7 rounded-full" style={{ background: 'var(--ps-bg-elevated)' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded w-1/3" style={{ background: 'var(--ps-bg-elevated)' }} />
            <div className="h-2.5 rounded w-1/4" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
          <div className="h-3 rounded w-12" style={{ background: 'rgba(255,255,255,0.03)' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHallOfFame() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="ps-card p-5 animate-skeleton" style={{ animationDelay: `${i * 80}ms`, borderWidth: '2px' }}>
            <div className="flex justify-between mb-3">
              <div className="w-7 h-7 rounded-full" style={{ background: 'var(--ps-bg-elevated)' }} />
              <div className="w-10 h-5 rounded-full" style={{ background: 'var(--ps-bg-elevated)' }} />
            </div>
            <div className="h-4 rounded w-2/3 mb-2" style={{ background: 'var(--ps-bg-elevated)' }} />
            <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-skeleton">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ps-card p-4">
            <div className="h-7 rounded w-16 mb-2" style={{ background: 'var(--ps-bg-elevated)' }} />
            <div className="h-3 rounded w-20" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ps-card p-5 h-48" />
        <div className="ps-card p-5 h-48" />
      </div>
    </div>
  );
}
