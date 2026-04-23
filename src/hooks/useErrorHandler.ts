import { useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from '@/utils/errorHandler';

interface ErrorHandlerOptions {
  showToast?: boolean;
  context?: string;
  onError?: (error: any) => void;
  fallbackMessage?: string;
}

/**
 * Hook for consistent error handling across components
 * Ensures all errors are displayed to users via toast notifications
 */
export function useErrorHandler() {
  const handleError = useCallback((
    error: any,
    options: ErrorHandlerOptions = {}
  ): string => {
    const {
      showToast = true,
      context = 'Operation',
      onError,
      fallbackMessage = 'An error occurred. Please try again.'
    } = options;

    // Get user-friendly message
    const message = errorHandler.getUserFriendlyMessage(error) || fallbackMessage;

    // Log error with context
    console.error(`[${context}] Error:`, error);

    // Show toast notification to user
    if (showToast) {
      toast.error(message);
    }

    // Call optional error callback
    if (onError) {
      onError(error);
    }

    return message;
  }, []);

  const handleApiError = useCallback((
    error: any,
    operation: string = 'API call'
  ): string => {
    return handleError(error, {
      context: `API: ${operation}`,
      showToast: true,
    });
  }, [handleError]);

  const handleFetchError = useCallback((
    error: any,
    resource: string = 'data'
  ): string => {
    return handleError(error, {
      context: `Fetch: ${resource}`,
      showToast: true,
      fallbackMessage: `Failed to load ${resource}. Please try again.`,
    });
  }, [handleError]);

  const handleSubmitError = useCallback((
    error: any,
    action: string = 'submit'
  ): string => {
    return handleError(error, {
      context: `Submit: ${action}`,
      showToast: true,
      fallbackMessage: `Failed to ${action}. Please try again.`,
    });
  }, [handleError]);

  const handleDeleteError = useCallback((
    error: any,
    item: string = 'item'
  ): string => {
    return handleError(error, {
      context: `Delete: ${item}`,
      showToast: true,
      fallbackMessage: `Failed to delete ${item}. Please try again.`,
    });
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleFetchError,
    handleSubmitError,
    handleDeleteError,
  };
}
