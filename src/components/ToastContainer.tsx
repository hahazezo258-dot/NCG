import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Package, X } from 'lucide-react';
import { useToastStore, type ToastItem } from '../store/toastStore';

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const trimmed = src?.trim();

  if (!trimmed || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-teal-700/60"
      >
        <Package className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <img
        src={trimmed}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef<number>(toast.durationMs);
  const startedAtRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  // Reset countdown whenever the toast is updated (e.g. coalesced rapid click)
  useEffect(() => {
    remainingRef.current = toast.durationMs;
  }, [toast.updatedAt, toast.durationMs]);

  useEffect(() => {
    if (toast.isClosing || isPaused) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onDismiss(toast.id);
    }, Math.max(0, remainingRef.current));

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast.id, toast.isClosing, toast.updatedAt, isPaused, onDismiss]);

  const handlePause = () => {
    if (isPaused || toast.isClosing) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(400, remainingRef.current - elapsed);
    setIsPaused(true);
  };

  const handleResume = () => {
    if (!isPaused || toast.isClosing) return;
    setIsPaused(false);
  };

  const isError = toast.variant === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocusCapture={handlePause}
      onBlurCapture={handleResume}
      className={`pointer-events-auto w-full rounded-xl border bg-white p-3.5 shadow-[0_10px_28px_-6px_rgba(15,23,42,0.14),0_2px_8px_-2px_rgba(15,23,42,0.06)] ${
        isError ? 'border-red-200' : 'border-slate-200/95'
      } ${toast.isClosing ? 'toast-exit' : 'toast-enter'}`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700"
          >
            <AlertCircle className="h-4 w-4" />
          </div>
        ) : toast.cartDetails ? (
          <ToastThumbnail
            src={toast.cartDetails.productImage}
            alt={toast.cartDetails.productName}
          />
        ) : (
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700"
          >
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {!isError && (
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-teal-700"
                  aria-hidden="true"
                />
              )}
              <p
                className={`font-display text-sm font-semibold leading-snug ${
                  isError ? 'text-red-900' : 'text-slate-900'
                }`}
              >
                {toast.title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {toast.cartDetails ? (
            <div className="mt-1 space-y-2">
              <p className="truncate text-sm font-medium text-slate-900">
                {toast.cartDetails.productName}
              </p>

              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-slate-600">
                <span className="tabular-nums">
                  <strong className="font-semibold text-slate-800">
                    {toast.cartDetails.bundleQuantity} × {toast.cartDetails.tierLabel}
                  </strong>
                  <span aria-hidden="true" className="mx-1.5 text-slate-300">
                    ·
                  </span>
                  <span>{toast.cartDetails.internalPackLabel}</span>
                </span>
                <span className="text-sm font-bold tabular-nums text-teal-800">
                  {toast.cartDetails.priceKwdLabel}
                </span>
              </div>

              {toast.cartDetails.mergedNote && (
                <p className="text-xs font-medium tabular-nums text-slate-500">
                  {toast.cartDetails.mergedNote}
                </p>
              )}

              <div className="flex items-center gap-2 pt-0.5">
                <Link
                  to="/cart"
                  onClick={() => onDismiss(toast.id)}
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <span>View cart</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            toast.message && (
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {toast.message}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const startDismiss = useToastStore((state) => state.startDismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-3 bottom-4 z-50 flex flex-col gap-2.5 sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-auto sm:w-[390px]"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={startDismiss} />
      ))}
    </div>
  );
}
