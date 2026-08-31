import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'pulse_access_token';
const REFRESH_TOKEN_KEY = 'pulse_refresh_token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  readonly accessToken = signal<string | null>(this.getAccessToken());

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.accessToken.set(accessToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessToken.set(null);
  }

  decodeToken(token: string | null = this.getAccessToken()): Record<string, any> | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(payload)));
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded['exp']) return true;
    return decoded['exp'] * 1000 < Date.now();
  }
}
