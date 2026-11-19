import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F9FB] px-4 py-12 text-slate-900">
          <div
            role="alert"
            className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg font-bold text-slate-900">
                  Unable to display application
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {this.state.errorMessage ??
                    'An unexpected error prevented the storefront from rendering.'}
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={this.handleReload}
                    className="btn-primary"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    <span>Reload page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
