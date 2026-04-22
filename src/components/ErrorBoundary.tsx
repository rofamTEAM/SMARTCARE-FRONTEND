'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches unexpected errors in child components and displays fallback UI
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.__errorTracker) {
      window.__errorTracker.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactElement | ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full">
              <div className="bg-card border border-destructive/20 rounded-lg p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="size-6 text-destructive flex-shrink-0" />
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">
                    Something went wrong
                  </h1>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded text-xs text-destructive overflow-auto max-h-32">
                    <p className="font-mono font-bold mb-1">Error Details:</p>
                    <p className="font-mono">{this.state.error.message}</p>
                    {this.state.errorInfo?.componentStack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-bold">Stack Trace</summary>
                        <pre className="mt-1 text-xs whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={this.handleReset}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex-1"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children as ReactElement;
  }
}

// Extend window interface for error tracker
declare global {
  interface Window {
    __errorTracker?: {
      captureException: (error: Error, context?: any) => void;
    };
  }
}
