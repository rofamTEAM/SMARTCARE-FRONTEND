/**
 * Secure Token Manager
 * Handles token storage using httpOnly cookies (server-side)
 * Tokens are automatically sent with requests via credentials: 'include'
 * This prevents XSS attacks from accessing tokens
 */

interface TokenManagerConfig {
  accessTokenKey?: string;
  refreshTokenKey?: string;
}

class TokenManager {
  private accessTokenKey: string;
  private refreshTokenKey: string;
  private inMemoryToken: string | null = null;

  constructor(config: TokenManagerConfig = {}) {
    this.accessTokenKey = config.accessTokenKey || 'accessToken';
    this.refreshTokenKey = config.refreshTokenKey || 'refreshToken';
  }

  /**
   * Store tokens - relies on httpOnly cookies from backend
   * Access token is kept in memory for reference only
   * Never store sensitive tokens in localStorage or sessionStorage
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    // Keep access token in memory for reference only
    // The actual token is stored in httpOnly cookie by backend
    this.inMemoryToken = accessToken;

    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[TokenManager] Tokens set (httpOnly cookie managed by backend)');
    }
  }

  /**
   * Get access token from memory
   * In production, this is only used for reference
   * Actual token is sent via httpOnly cookie automatically
   */
  getAccessToken(): string | null {
    return this.inMemoryToken;
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.inMemoryToken = null;

    // Optionally clear any cookies via backend endpoint
    // Backend should handle httpOnly cookie deletion
    if (process.env.NODE_ENV === 'development') {
      console.debug('[TokenManager] Tokens cleared');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.inMemoryToken !== null;
  }

  /**
   * Validate token format (basic check)
   */
  private isValidTokenFormat(token: string): boolean {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Decode token payload (for reference only, don't trust client-side)
   * Always validate on backend
   */
  decodeToken(token: string): Record<string, any> | null {
    try {
      if (!this.isValidTokenFormat(token)) {
        return null;
      }

      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('[TokenManager] Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    // exp is in seconds, convert to milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Consider token expired if less than 1 minute remaining
    const bufferTime = 60 * 1000;
    return currentTime >= expirationTime - bufferTime;
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
