import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'grid' | 'detail' | 'table' | 'inline';
  label?: string;
}

export function LoadingState({
  variant = 'inline',
  label = 'Loading medical catalog...',
}: LoadingStateProps) {
  if (variant === 'grid') {
    return (
      <div role="status" aria-live="polite" aria-label={label}>
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-teal-700" aria-hidden="true" />
          <span>{label}</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-4 h-3 w-32 animate-pulse rounded bg-slate-100" />
              <div className="mt-2.5 h-5 w-3/4 animate-pulse rounded bg-slate-200/80" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-4 space-y-2">
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              </div>
              <div className="mt-4 flex gap-3 pt-2">
                <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-200/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div role="status" aria-live="polite" aria-label={label} className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-teal-700" aria-hidden="true" />
          <span>{label}</span>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          </div>
          <div className="space-y-4 lg:col-span-6">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-20 w-full animate-pulse rounded bg-slate-100" />
            <div className="space-y-2.5 pt-2">
              <div className="h-14 w-full animate-pulse rounded-lg bg-slate-100" />
              <div className="h-14 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3.5 text-sm font-medium text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-teal-700" aria-hidden="true" />
          <span>{label}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-lg bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-200/80" />
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2.5 py-12 text-sm font-medium text-slate-600"
    >
      <Loader2 className="h-5 w-5 animate-spin text-teal-700" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
