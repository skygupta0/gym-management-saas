import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormErrorUtil } from '../../../core/util/form-error.util';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastContainerComponent],
  template: `
    <div class="auth-layout">
      <!-- Floating Top Theme Toggle -->
      <div class="auth-top-actions">
        <button type="button" class="theme-toggle-btn" (click)="themeService.toggleTheme()">
          <span>{{ themeService.isDarkMode() ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode' }}</span>
        </button>
      </div>

      <div class="auth-container">
        <!-- Brand Header -->
        <div class="auth-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">Pulse<span class="text-gradient">Gym</span></span>
        </div>

        <div class="auth-card glass-card">
          @if (!emailSent()) {
            <div class="card-header">
              <h2 class="card-title">Reset Your Password</h2>
              <p class="card-subtitle">
                Enter the email associated with your gym account, and we'll dispatch a secure recovery token.
              </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
              <div class="form-group">
                <label class="form-label" for="email">Registered Email Address</label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  placeholder="owner@yourgym.com"
                  formControlName="email"
                  [class.is-invalid]="getFieldError('email')"
                />
                @if (getFieldError('email'); as err) {
                  <span class="form-error">{{ err }}</span>
                }
              </div>

              <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="isLoading()">
                @if (isLoading()) {
                  <span class="spinner"></span>
                  <span>Sending Reset Link...</span>
                } @else {
                  <span>Send Recovery Instructions →</span>
                }
              </button>
            </form>
          } @else {
            <!-- Success Confirmation -->
            <div class="success-state animate-fade-in">
              <div class="success-icon-wrap">📧</div>
              <h2 class="card-title">Check Your Inbox</h2>
              <p class="card-subtitle">
                If an active account exists for <strong>{{ sentEmail() }}</strong>, you will receive password reset instructions shortly.
              </p>

              <div class="recovery-tip">
                <p>💡 Tip: Have a recovery token already?</p>
                <a routerLink="/auth/reset-password" class="btn btn-secondary btn-sm" style="margin-top: 8px;">
                  Enter Reset Token Directly →
                </a>
              </div>

              <button type="button" class="btn btn-secondary btn-sm" (click)="emailSent.set(false)">
                Try another email
              </button>
            </div>
          }

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

    .success-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 10px 0 20px 0;
    }

    .success-icon-wrap {
      font-size: 3rem;
      margin-bottom: 4px;
    }

    .recovery-tip {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 10px 0 14px 0;
      width: 100%;
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
      transition: color var(--transition-fast);
    }

    .back-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  readonly themeService = inject(ThemeService);

  readonly isLoading = signal<boolean>(false);
  readonly emailSent = signal<boolean>(false);
  readonly sentEmail = signal<string>('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  getFieldError(fieldName: 'email'): string | null {
    return FormErrorUtil.getErrorMessage(this.form.get(fieldName), 'Registered email');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const email = this.form.getRawValue().email!;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.sentEmail.set(email);
        this.emailSent.set(true);
        this.notification.success('Recovery Dispatched', res.message || 'Password reset link dispatched.');
      },
      error: (err) => {
        this.isLoading.set(false);
        FormErrorUtil.applyServerErrors(this.form, err);
      }
    });
  }
}
