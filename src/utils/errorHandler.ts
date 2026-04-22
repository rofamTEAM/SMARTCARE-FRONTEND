/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

import { ApiError, ErrorType } from '@/services/apiClient';

export interface ErrorLog {
  timestamp: string;
  type: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

class ErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 50;

  /**
   * Log error to internal storage
   */
  private logToStorage(log: ErrorLog): void {
    this.errorLogs.push(log);

    // Keep only recent logs
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    // Logs are kept in memory only - no localStorage persistence
    // For persistent error logging, use backend API
  }

  /**
   * Handle API errors
   */
  handleApiError(error: any): string {
    const apiError = error as ApiError;

    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: 'API_ERROR',
      message: apiError.message || 'Unknown API error',
      context: {
        status: apiError.status,
        code: apiError.code,
        isNetworkError: apiError.isNetworkError,
        isCorsError: apiError.isCorsError,
        errors: apiError.errors,
        rawError: JSON.stringify(error),
      },
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logToStorage(log);

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', log);
      console.error('Raw error object:', error);
    }

    // Return the actual backend message if available, not a generic override
    return apiError.message || 'An error occurred';
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: Record<string, string[]>): string {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: 'VALIDATION_ERROR',
      message: 'Validation failed',
      context: { errors },
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.logToStorage(log);

    if (process.env.NODE_ENV === 'development') {
      console.warn('Validation Error:', log);
    }

    return errorMessages;
  }

  /**
   * Handle unexpected errors
   */
  handleUnexpectedError(error: Error, context?: Record<string, any>): string {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: 'UNEXPECTED_ERROR',
      message: error.message,
      stack: error.stack,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.logToStorage(log);

    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected Error:', log);
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: Error): string {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: 'NETWORK_ERROR',
      message: error.message,
      context: {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
      },
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.logToStorage(log);

    if (process.env.NODE_ENV === 'development') {
      console.error('Network Error:', log);
    }

    return 'Network connection failed. Please check your internet connection.';
  }

  /**
   * Handle CORS errors
   */
  handleCorsError(error: Error): string {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: 'CORS_ERROR',
      message: error.message,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.logToStorage(log);

    if (process.env.NODE_ENV === 'development') {
      console.error('CORS Error:', log);
    }

    return 'Cross-Origin request blocked. Please contact support.';
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (!error) {
      return 'An error occurred';
    }

    // Log raw error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR HANDLER] getUserFriendlyMessage received:', error);
      console.error('[ERROR HANDLER] Error type:', typeof error);
      console.error('[ERROR HANDLER] Error keys:', Object.keys(error));
      console.error('[ERROR HANDLER] Error.message:', error?.message);
      console.error('[ERROR HANDLER] Error.status:', error?.status);
    }

    // Handle API errors (plain objects with status property)
    if (typeof error === 'object' && error !== null) {
      // Check if it has a message property (API error)
      if ('message' in error && error.message) {
        console.log('[ERROR HANDLER] Returning API error message:', error.message);
        return error.message;
      }
      
      // Check for validation errors array
      if ('errors' in error && Array.isArray(error.errors) && error.errors.length > 0) {
        const validationErrors = error.errors
          .map((e: any) => e.message || e.field || JSON.stringify(e))
          .join(', ');
        console.log('[ERROR HANDLER] Returning validation errors:', validationErrors);
        return validationErrors;
      }

      // Check if it's an empty object or has no useful properties
      const keys = Object.keys(error);
      if (keys.length === 0 || (keys.length === 1 && keys[0] === 'status' && error.status === 0)) {
        return 'Failed to fetch data. Please try again.';
      }
    }

    // Handle Error objects
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        return this.handleCorsError(error);
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return this.handleNetworkError(error);
      }
      return this.handleUnexpectedError(error);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    return 'Failed to fetch data. Please try again.';
  }

  /**
   * Get all error logs
   */
  getLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.errorLogs = [];
    // Logs are kept in memory only
  }

  /**
   * Export error logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }
}

export const errorHandler = new ErrorHandler();
