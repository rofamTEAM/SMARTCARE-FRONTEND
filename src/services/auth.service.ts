import { authApi, AuthResponse, clearTokens, type AuthUser } from '@/utils/api';

export type { AuthResponse, AuthUser };

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await authApi.login(credentials);
    // Persist tokens for subsequent requests
    if (res.tokens?.accessToken) {
      localStorage.setItem('auth_token', res.tokens.accessToken);
      if (res.tokens.refreshToken) {
        localStorage.setItem('refresh_token', res.tokens.refreshToken);
      }
    }
    return res;
  },

  async register(data: {
    email: string;
    password: string;
    name: string;
    roleEnum?: string;
  }): Promise<{ user: AuthUser }> {
    return authApi.register(data);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const res = await authApi.me();
      // Handle both { user } and direct user object shapes
      return (res as any)?.user ?? (res as any) ?? null;
    } catch {
      return null;
    }
  },

  logout(): void {
    clearTokens();
    // Fire-and-forget backend logout (clears any server-side session)
    authApi.logout().catch(() => {});
  },
};
