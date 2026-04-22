/**
 * Secure Authentication Hook
 * Manages authentication state with secure token handling
 * Uses httpOnly cookies for token storage (server-side)
 */

import { useEffect, useState, useCallback } from 'react';
import { tokenManager } from '@/utils/tokenManager';
import { authService } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface UseSecureAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
}

export function useSecureAuth(): UseSecureAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get current user from backend
        // Backend will validate httpOnly cookie
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // Mark as authenticated in token manager
        if (tokenManager.getAccessToken()) {
          // Token already in memory from previous session
        }
      } catch (err: any) {
        // Not authenticated or session expired
        setUser(null);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Monitor token expiration
  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) {
      return;
    }

    const expirationTime = tokenManager.getTokenExpirationTime(token);
    if (!expirationTime) {
      return;
    }

    // Set up refresh before expiration (5 minutes before)
    const now = Date.now();
    const expirationMs = expirationTime.getTime();
    const timeUntilExpiration = expirationMs - now;
    const refreshTime = timeUntilExpiration - 5 * 60 * 1000; // Refresh 5 min before expiry

    if (refreshTime <= 0) {
      // Token already expired or expiring soon
      handleRefreshToken();
      return;
    }

    const timeoutId = setTimeout(() => {
      handleRefreshToken();
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [user]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.login({ email, password });
        const tokens = response.tokens || response.data?.tokens;
        const userData = response.user || response.data?.user;

        if (!tokens?.accessToken) {
          throw new Error('Login failed: No access token received');
        }

        // Store token reference in memory
        // Actual token is in httpOnly cookie (set by backend)
        tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

        // Normalize user data
        const normalizedUser = {
          ...userData,
          role: userData.role?.toLowerCase() || 'user',
        };

        setUser(normalizedUser);
        setError(null);
      } catch (err: any) {
        const errorMessage = err?.message || 'Login failed';
        setError(errorMessage);
        setUser(null);
        tokenManager.clearTokens();
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend logout to clear httpOnly cookie
      await authService.logout();

      // Clear local state
      tokenManager.clearTokens();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err?.message || 'Logout failed';
      setError(errorMessage);
      // Still clear local state even if backend logout fails
      tokenManager.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      const tokens = response.tokens || response.data?.tokens;

      if (!tokens?.accessToken) {
        throw new Error('Token refresh failed: No access token received');
      }

      // Update token reference in memory
      tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
    } catch (err: any) {
      // Refresh failed, user needs to login again
      console.error('Token refresh failed:', err);
      tokenManager.clearTokens();
      setUser(null);
      setError('Session expired. Please login again.');
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && tokenManager.isAuthenticated(),
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    error,
  };
}
