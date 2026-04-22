/**
 * useApiState Hook
 * Manages API request state (loading, error, data)
 * Replaces localStorage-based state management
 * Includes comprehensive error handling
 */

import { useState, useCallback, useEffect } from 'react';
import { errorHandler } from '@/utils/errorHandler';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface UseApiStateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Hook for managing API request state
 * 
 * Usage:
 * const { data, loading, error, execute } = useApiState(
 *   () => patientsService.getAll(),
 *   { autoFetch: true }
 * );
 */
export function useApiState<T>(
  apiCall: () => Promise<T>,
  options: UseApiStateOptions = {}
) {
  const { onSuccess, onError, autoFetch = false, retryCount = 0, retryDelay = 1000 } = options;
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
    isSuccess: false,
  });
  const [retries, setRetries] = useState(0);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        isSuccess: true,
      });
      setRetries(0);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = errorHandler.getUserFriendlyMessage(err);
      
      // Retry logic for network errors
      if (retries < retryCount && (err.isNetworkError || err.status === 0)) {
        setTimeout(() => {
          setRetries((prev) => prev + 1);
          execute();
        }, retryDelay);
        return;
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        isSuccess: false,
      });
      onError?.(errorMessage);
      throw err;
    }
  }, [apiCall, onSuccess, onError, retries, retryCount, retryDelay]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  return {
    ...state,
    execute,
    reset: () =>
      setState({
        data: null,
        loading: false,
        error: null,
        isSuccess: false,
      }),
  };
}

/**
 * Hook for managing paginated API requests
 */
export function useApiPagination<T>(
  apiCall: (page: number, limit: number) => Promise<any>
) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [state, setState] = useState<ApiState<T[]>>({
    data: null,
    loading: true,
    error: null,
    isSuccess: false,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiCall(page, limit);
      setState({
        data: result.data,
        loading: false,
        error: null,
        isSuccess: true,
      });
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      const errorMessage = errorHandler.getUserFriendlyMessage(err);
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        isSuccess: false,
      });
    }
  }, [apiCall, page, limit]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
  };
}

/**
 * Hook for managing form submission to API
 */
export function useApiMutation<T, R = void>(
  apiCall: (data: T) => Promise<R>
) {
  const [state, setState] = useState<ApiState<R>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
  });

  const mutate = useCallback(
    async (data: T) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiCall(data);
        setState({
          data: result,
          loading: false,
          error: null,
          isSuccess: true,
        });
        return result;
      } catch (err: any) {
        const errorMessage = errorHandler.getUserFriendlyMessage(err);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          isSuccess: false,
        });
        throw err;
      }
    },
    [apiCall]
  );

  return {
    ...state,
    mutate,
    reset: () =>
      setState({
        data: null,
        loading: false,
        error: null,
        isSuccess: false,
      }),
  };
}
