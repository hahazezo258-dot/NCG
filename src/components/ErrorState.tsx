import { AlertTriangle, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to connect to catalog database',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="surface-card border-red-200 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{message}</p>

          {!isSupabaseConfigured && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-900">Required environment variables:</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 font-medium text-slate-700">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
              <p className="mt-2 text-slate-600">
                Ensure both variables are configured in your environment and restart the server.
              </p>
            </div>
          )}

          {onRetry && (
            <div className="mt-5">
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Retry connection</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
