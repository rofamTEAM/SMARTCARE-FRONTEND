/**
 * Compatibility shim — all service files import from here.
 * The actual implementation lives in @/utils/api.ts
 */

export type { ApiError } from '@/utils/api';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

async function request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body instanceof FormData) delete headers['Content-Type'];
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 401 && retry) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data?.tokens?.accessToken ?? data?.data?.tokens?.accessToken;
            if (newToken) {
              localStorage.setItem('auth_token', newToken);
              return request<T>(endpoint, options, false);
            }
          }
        } catch { /* refresh failed */ }
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      throw { message: 'Session expired. Please log in again.', status: 401 };
    }

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try { const body = await res.json(); message = body?.message ?? message; } catch { /* ignore */ }
      throw { message, status: res.status };
    }

    const text = await res.text();
    if (!text) return {} as T;
    const json = JSON.parse(text);
    return (json?.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.status !== undefined) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw { message: 'Request timed out.', status: 408 };
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw { message: 'Cannot connect to server.', status: 0 };
    }
    throw { message: err?.message ?? 'An unexpected error occurred.', status: 0 };
  }
}

class ApiClient {
  setAuthToken(token: string) { if (typeof window !== 'undefined') localStorage.setItem('auth_token', token); }
  clearAuthToken() { if (typeof window !== 'undefined') { localStorage.removeItem('auth_token'); localStorage.removeItem('refresh_token'); } }
  getAuthToken() { return getToken(); }

  get<T>(endpoint: string): Promise<T> { return request<T>(endpoint, { method: 'GET' }); }
  post<T>(endpoint: string, body: unknown): Promise<T> { return request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put<T>(endpoint: string, body: unknown): Promise<T> { return request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  patch<T>(endpoint: string, body: unknown): Promise<T> { return request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete<T>(endpoint: string): Promise<T> { return request<T>(endpoint, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient();
