import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormErrorUtil } from '../../../core/util/form-error.util';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastContainerComponent],
  template: `
    <div class="auth-layout">
      <div class="auth-top-actions">
        <button type="button" class="theme-toggle-btn" (click)="themeService.toggleTheme()">
          <span>{{ themeService.isDarkMode() ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode' }}</span>
        </button>
      </div>

      <div class="auth-container">
        <div class="auth-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">Pulse<span class="text-gradient">Gym</span></span>
        </div>

        <div class="auth-card glass-card">
          <div class="card-header">
            <h2 class="card-title">Set New Password</h2>
            <p class="card-subtitle">
              Enter your reset verification token and choose a strong new password.
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="token">Reset Verification Token</label>
              <input
                id="token"
                type="text"
                class="form-control"
                placeholder="e.g. 3a8f9c2e-4b1d-4e9a-9c7f..."
                formControlName="token"
                [class.is-invalid]="getFieldError('token')"
              />
              @if (getFieldError('token'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="newPassword">New Password (min 6 characters)</label>
              <input
                id="newPassword"
                type="password"
                class="form-control"
                placeholder="••••••••"
                formControlName="newPassword"
                [class.is-invalid]="getFieldError('newPassword')"
              />
              @if (getFieldError('newPassword'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                class="form-control"
                placeholder="••••••••"
                formControlName="confirmPassword"
                [class.is-invalid]="getFieldError('confirmPassword')"
              />
              @if (getFieldError('confirmPassword'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner"></span>
                <span>Resetting Password...</span>
              } @else {
                <span>Update Password & Sign In →</span>
              }
            </button>
          </form>

          <div class="card-footer">
            <a routerLink="/auth/login" class="back-link">
              ← Back to Sign In
            </a>
          </div>
        </div>
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-app);
      position: relative;
      padding: 40px 20px;
      transition: background-color var(--transition-normal);
    }

    .auth-top-actions {
      position: absolute;
      top: 20px;
      right: 24px;
      z-index: 100;
    }

    .auth-container {
      width: 100%;
      max-width: 460px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--accent-gradient);
      color: #04101e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 900;
      box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
    }

    .brand-name {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .auth-card {
      width: 100%;
      padding: 36px 32px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      backdrop-filter: var(--glass-blur);
    }

    .card-header {
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .card-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .submit-btn {
      width: 100%;
      margin-top: 10px;
    }

    .card-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
      text-align: center;
    }

    .back-link {
      font-size: 0.875rem;
      color: var(--primary-cyan);
      font-weight: 600;
      text-decoration: none;
    }

    .back-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly isLoading = signal<boolean>(false);

  readonly form = this.fb.group({
    token: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.patchValue({ token });
    }
  }

  getFieldError(field: 'token' | 'newPassword' | 'confirmPassword'): string | null {
    if (field === 'confirmPassword') {
      const p = this.form.get('newPassword')?.value;
      const cp = this.form.get('confirmPassword')?.value;
      const control = this.form.get('confirmPassword');
      if (control?.touched && p && cp && p !== cp) {
        return 'Passwords do not match';
      }
    }

    const labels: Record<string, string> = {
      token: 'Reset token',
      newPassword: 'New password',
      confirmPassword: 'Confirm password'
    };
    return FormErrorUtil.getErrorMessage(this.form.get(field), labels[field]);
  }

  onSubmit(): void {
    const p = this.form.get('newPassword')?.value;
    const cp = this.form.get('confirmPassword')?.value;

    if (p !== cp) {
      this.form.get('confirmPassword')?.setErrors({ serverError: 'Passwords do not match' });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { token, newPassword } = this.form.getRawValue();

    this.authService.resetPassword(token!, newPassword!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.notification.success('Password Updated', res.message || 'You can now sign in with your new password.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        FormErrorUtil.applyServerErrors(this.form, err);
      }
    });
  }
}
