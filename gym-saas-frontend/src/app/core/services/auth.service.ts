import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthResponse, LoginRequest, TenantOnboardRequest, User } from '../models/auth.models';
import { TokenService } from './token.service';
import { NotificationService } from './notification.service';

const USER_KEY = 'pulse_user';
const GYM_KEY = 'pulse_gym';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  private readonly apiUrl = '/api/v1/auth';
  private readonly gymApiUrl = '/api/v1/gyms';

  readonly currentUser = signal<User | null>(this.getSavedUser());
  readonly currentGym = signal<{ name: string; slug: string } | null>(this.getSavedGym());

  readonly isAuthenticated = computed(() => {
    const token = this.tokenService.accessToken();
    return !!token && !this.tokenService.isTokenExpired();
  });

  readonly isOwner = computed(() => this.currentUser()?.role === 'GYM_OWNER');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'GYM_ADMIN');
  readonly isStaff = computed(() => this.currentUser()?.role === 'STAFF' || this.currentUser()?.role === 'TRAINER');

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
          this.notification.success('Welcome back!', `Logged in as ${response.data.user.fullName}`);
        }
      })
    );
  }

  onboardGym(data: TenantOnboardRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.gymApiUrl}/onboard`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
          this.notification.success('Gym Registered!', `Welcome to ${response.data.gymName}`);
        }
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {}
      });
    }

    this.tokenService.clearTokens();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GYM_KEY);
    this.currentUser.set(null);
    this.currentGym.set(null);
    this.router.navigate(['/auth/login']);
    this.notification.info('Logged out', 'You have been safely signed out.');
  }

  private handleAuthSuccess(authData: AuthResponse): void {
    this.tokenService.setTokens(authData.accessToken, authData.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
    this.currentUser.set(authData.user);

    if (authData.gymName && authData.gymSlug) {
      const gym = { name: authData.gymName, slug: authData.gymSlug };
      localStorage.setItem(GYM_KEY, JSON.stringify(gym));
      this.currentGym.set(gym);
    }
  }

  private getSavedUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private getSavedGym(): { name: string; slug: string } | null {
    const stored = localStorage.getItem(GYM_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
