import { apiClient } from './apiClient';

// ---------------------------------------------------------------------------
// Types (kept for backward compatibility with services/index.ts exports)
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  roleEnum?: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
}

export interface UserProfile {
  id: string | number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  phone?: string;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    if (res.tokens?.accessToken) {
      localStorage.setItem('auth_token', res.tokens.accessToken);
      if (res.tokens.refreshToken) {
        localStorage.setItem('refresh_token', res.tokens.refreshToken);
      }
    }
    return res;
  }

  async register(data: RegisterRequest): Promise<{ user: UserProfile }> {
    return apiClient.post<{ user: UserProfile }>('/auth/register', data);
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get<any>('/auth/me');
      return (res as any)?.user ?? res ?? null;
    } catch {
      return null;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/auth/profile', data);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { oldPassword, newPassword });
  }

  logout(): void {
    apiClient.clearAuthToken();
    apiClient.post('/auth/logout', {}).catch(() => {});
  }

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', {});
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  }
}

export const authService = new AuthService();
