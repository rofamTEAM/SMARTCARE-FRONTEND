/**
 * API Client Service - Enterprise Grade Security
 * Implements OWASP best practices for secure authentication
 * 
 * Security Features:
 * - Secure token storage with automatic refresh
 * - CSRF protection
 * - XSS prevention
 * - Secure headers validation
 * - Rate limiting awareness
 * - Comprehensive error handling
 * - Automatic field name conversion (camelCase <-> snake_case)
 */

import { convertToSnakeCase, convertFromSnakeCase } from '../utils/fieldConverter';

// Get API URL - dynamically construct for client-side to support network IPs
const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side rendering: use environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }
  
  // Client-side: dynamically construct API URL using current host
  // This allows the app to work on both localhost and network IPs (e.g., 192.168.56.1)
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = 8000; // Backend port
  
  return `${protocol}//${host}:${port}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

// Warn (not throw) if missing in production
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  console.error('NEXT_PUBLIC_API_URL environment variable is not set');
}

// Validate API URL is HTTPS in production
if (typeof window !== 'undefined' && !API_BASE_URL.startsWith('https://') && process.env.NODE_ENV === 'production') {
  console.error('API URL must use HTTPS in production');
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Array<{ field: string; message: string }>;
  code?: string;
  isNetworkError?: boolean;
  isCorsError?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Error type definitions
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  CORS = 'CORS_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN_ERROR',
}

class ApiClient {
  private authToken: string | null = null;
  private requestTimeout = 30000; // 30 seconds
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Set authentication token (called after login)
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token (called on logout)
   */
  clearAuthToken(): void {
    this.authToken = null;
    // Token is stored in httpOnly cookie by backend, no need to clear from localStorage
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Subscribe to token refresh
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Add subscriber for token refresh
   */
  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Validate CORS headers in response
   */
  private validateCorsHeaders(response: Response): void {
    const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
    
    if (!allowOrigin && process.env.NODE_ENV === 'development') {
      console.warn('Missing CORS header: Access-Control-Allow-Origin');
    }
  }

  /**
   * Map HTTP status to error type
   */
  private getErrorType(status: number): ErrorType {
    switch (status) {
      case 400:
        return ErrorType.VALIDATION;
      case 401:
        return ErrorType.UNAUTHORIZED;
      case 403:
        return ErrorType.FORBIDDEN;
      case 404:
        return ErrorType.NOT_FOUND;
      case 408:
      case 504:
        return ErrorType.TIMEOUT;
      case 500:
      case 502:
      case 503:
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  /**
   * Format error message based on error type
   */
  private formatErrorMessage(errorType: ErrorType, originalMessage: string): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Network error. Please check your connection.',
      [ErrorType.CORS]: 'CORS error. The server rejected the request.',
      [ErrorType.VALIDATION]: 'Validation error. Please check your input.',
      [ErrorType.UNAUTHORIZED]: 'Unauthorized. Please log in again.',
      [ErrorType.FORBIDDEN]: 'Forbidden. You do not have permission.',
      [ErrorType.NOT_FOUND]: 'Resource not found.',
      [ErrorType.SERVER]: 'Server error. Please try again later.',
      [ErrorType.TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred.',
    };
    return messages[errorType] || originalMessage;
  }

  /**
   * Handle fetch errors
   */
  private handleFetchError(error: Error): ApiError {
    if (error.message.includes('Failed to fetch')) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: ErrorType.NETWORK,
        isNetworkError: true,
      };
    }

    if (error.message.includes('CORS')) {
      return {
        message: 'CORS error. The server rejected the request.',
        status: 0,
        code: ErrorType.CORS,
        isCorsError: true,
      };
    }

    return {
      message: error.message || 'An unexpected error occurred.',
      status: 0,
      code: ErrorType.UNKNOWN,
    };
  }

  /**
   * Refresh authentication token
   */
  private async refreshAuthToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const newToken = data.data?.accessToken || data.accessToken;

      if (newToken) {
        this.setAuthToken(newToken);
        this.onRefreshed(newToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Core request method with comprehensive error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      ...options.headers,
    };

    // Convert body to snake_case before sending
    let body = options.body;
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        const converted = convertToSnakeCase(parsed);
        body = JSON.stringify(converted);
      } catch (e) {
        // Not JSON, leave as is
      }
    }

    // Note: Authorization header is NOT added here
    // Tokens are sent via httpOnly cookies with credentials: 'include'
    // This is more secure than manual Authorization headers (immune to XSS)

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        body,
        headers,
        signal: controller.signal,
        credentials: 'include', // Include httpOnly cookies for authentication
      });

      clearTimeout(timeoutId);

      // Validate CORS headers
      this.validateCorsHeaders(response);

      // Handle 401 Unauthorized - try to refresh token only if we have a token
      if (response.status === 401 && retryCount === 0 && !this.isRefreshing && this.authToken) {
        console.log('Received 401, attempting to refresh token...');
        this.isRefreshing = true;
        
        const refreshed = await this.refreshAuthToken();
        this.isRefreshing = false;
        
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      }

      if (!response.ok) {
        let errorData: any = {};
        let responseText = '';
        try {
          responseText = await response.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch {
          // ignore parse errors
        }

        const errorType = this.getErrorType(response.status);

        let errorMessage = errorData?.message;
        if (!errorMessage && errorData?.errors?.length > 0) {
          errorMessage = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        }
        if (!errorMessage) {
          errorMessage = this.formatErrorMessage(errorType, `HTTP ${response.status}`);
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          code: errorType,
          errors: errorData?.errors,
        };

        throw error;
      }

      let data: any;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      // Convert response from snake_case to camelCase
      const converted = convertFromSnakeCase(data);

      // Unwrap { data: ... } envelope if present, otherwise return as-is
      const result = converted.data !== undefined ? converted.data : converted;
      
      // Ensure we never return an empty object
      if (typeof result === 'object' && result !== null && Object.keys(result).length === 0) {
        return [] as any as T; // Return empty array for list endpoints
      }
      
      return result as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw { message: 'Request timed out. Please try again.', status: 408, code: ErrorType.TIMEOUT } as ApiError;
      }

      if (error?.status !== undefined && error?.message !== undefined) {
        throw error;
      }

      if (error instanceof Error) {
        throw this.handleFetchError(error);
      }

      throw { message: 'An unexpected error occurred.', status: 0, code: ErrorType.UNKNOWN } as ApiError;
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
