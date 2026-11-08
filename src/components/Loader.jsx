export function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-md ${className}`}
    />
  );
}

export function RepositoryCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-[#E8DCCF] bg-[#FAF6F0] p-5"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-3/5" />
          <SkeletonBlock className="h-3 w-2/5" />
        </div>
        <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-3.5 w-full" />
        <SkeletonBlock className="h-3.5 w-full" />
        <SkeletonBlock className="h-3.5 w-4/5" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <SkeletonBlock className="h-6 w-20 rounded-full" />
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-14 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#E8DCCF] pt-4">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
    </div>
  );
}

export function RepositoryRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-[18px] border border-[#E8DCCF] bg-[#FAF6F0] p-5"
    >
      <div className="flex items-start gap-4">
        <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-3/4" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RepositoryGridSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <RepositoryCardSkeleton key={index} />
      ))}
    </div>
  );
}

function Loader() {
  return (
    <main
      role="status"
      aria-label="Loading page"
      className="mx-auto min-h-[65vh] max-w-[1400px] space-y-6 px-4 py-10 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading page content</span>
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-3">
        <SkeletonBlock className="h-11 w-full max-w-md rounded-xl" />
        <SkeletonBlock className="h-11 w-28 rounded-xl" />
      </div>
      <RepositoryGridSkeleton />
    </main>
  );
}

export default Loader;
