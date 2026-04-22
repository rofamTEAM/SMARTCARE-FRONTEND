/**
 * Universal Form Submission Hook
 * Provides consistent error handling and loading state management for all forms
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from '../utils/errorHandler';

export interface UseFormSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useFormSubmit(options: UseFormSubmitOptions = {}) {
  const {
    onSuccess,
    onError,
    successMessage = 'Operation completed successfully!',
    errorMessage = 'Operation failed. Please try again.',
    showToast = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (submitFn: () => Promise<any>) => {
      setLoading(true);
      setError(null);

      try {
        console.log('[useFormSubmit] Starting form submission...');
        const result = await submitFn();
        console.log('[useFormSubmit] Form submission successful:', result);

        if (showToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        console.error('[useFormSubmit] Form submission error:', err);
        console.error('[useFormSubmit] Error type:', typeof err);
        console.error('[useFormSubmit] Error keys:', Object.keys(err || {}));

        // Get user-friendly error message
        const userMessage = errorHandler.getUserFriendlyMessage(err) || errorMessage;
        setError(userMessage);

        if (showToast) {
          toast.error(userMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, successMessage, errorMessage, showToast]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    submit,
    loading,
    error,
    reset,
  };
}
