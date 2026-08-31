import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormErrorUtil } from '../../../core/util/form-error.util';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastContainerComponent],
  template: `
    <div class="login-layout">
      <!-- Left Visual Showcase -->
      <div class="login-showcase">
        <div class="showcase-glow"></div>
        <div class="showcase-content">
          <div class="showcase-brand">
            <span class="showcase-logo-icon">⚡</span>
            <span class="showcase-brand-name">Pulse<span class="text-gradient">Gym</span></span>
          </div>

          <div class="showcase-hero">
            <h1 class="showcase-title">
              Power Your Gym <br />
              <span class="text-gradient">Without Friction.</span>
            </h1>
            <p class="showcase-desc">
              Next-generation multi-tenant SaaS management for high-growth fitness clubs, CrossFit boxes, and boutique wellness studios.
            </p>
          </div>

          <!-- Feature Badges -->
          <div class="showcase-features">
            <div class="feature-item">
              <div class="feature-icon">🛡️</div>
              <div class="feature-text">
                <strong>Strict Tenant Isolation</strong>
                <span>Bank-grade data separation per gym</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">
                <strong>Automated Expiry Engine</strong>
                <span>Scheduled renewals & instant notifications</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-text">
                <strong>Real-Time Analytics</strong>
                <span>Live attendance tracking & revenue KPIs</span>
              </div>
            </div>
          </div>

          <div class="showcase-footer">
            <span>© 2026 PulseGym SaaS. Enterprise Edition.</span>
          </div>
        </div>
      </div>

      <!-- Right Form Section -->
      <div class="login-form-section">
        <div class="login-card glass-card">
          <div class="login-header">
            <h2 class="login-title">Sign In</h2>
            <p class="login-subtitle">Access your gym management dashboard</p>
          </div>

          <!-- Demo Credential Quick-Fill -->
          <div class="demo-box">
            <div class="demo-title">⚡ Quick Fill Demo Accounts:</div>
            <div class="demo-buttons">
              <button type="button" class="btn btn-secondary btn-sm" (click)="fillDemo('karan@spartanfit.com', 'Password123!')">
                Spartan Gym Owner
              </button>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
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

            <div class="form-group">
              <div class="flex-between">
                <label class="form-label" for="password">Password</label>
              </div>
              <div class="password-input-wrap">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-control"
                  placeholder="••••••••"
                  formControlName="password"
                  [class.is-invalid]="getFieldError('password')"
                />
                <button type="button" class="pwd-toggle-btn" (click)="togglePasswordVisibility()" aria-label="Toggle Password Visibility">
                  {{ showPassword() ? '👁️' : '🔒' }}
                </button>
              </div>
              @if (getFieldError('password'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner"></span>
                <span>Signing In...</span>
              } @else {
                <span>Sign In to Dashboard →</span>
              }
            </button>
          </form>

          <div class="login-card-footer">
            <span>Looking to register a new gym?</span>
            <a routerLink="/auth/onboard" class="register-link">Register Gym Onboarding →</a>
          </div>
        </div>
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .login-layout {
      min-height: 100vh;
      display: flex;
      background: var(--bg-app);
    }

    /* Left Showcase */
    .login-showcase {
      flex: 1.1;
      background: linear-gradient(135deg, #090d16 0%, #101929 50%, #060910 100%);
      padding: 60px 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      border-right: 1px solid var(--border-subtle);
    }

    .showcase-glow {
      position: absolute;
      top: 15%;
      left: 10%;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.05) 50%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
    }

    .showcase-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    .showcase-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .showcase-logo-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--accent-gradient);
      color: #04101e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 900;
      box-shadow: 0 0 24px rgba(0, 242, 254, 0.4);
    }

    .showcase-brand-name {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 800;
      color: #ffffff;
    }

    .showcase-hero {
      margin: 40px 0;
    }

    .showcase-title {
      font-size: 3rem;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 20px;
    }

    .showcase-desc {
      font-size: 1.1rem;
      color: var(--text-secondary);
      max-width: 520px;
      line-height: 1.6;
    }

    .showcase-features {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      padding: 16px 20px;
      border-radius: var(--radius-lg);
      max-width: 480px;
    }

    .feature-icon {
      font-size: 1.4rem;
    }

    .feature-text {
      display: flex;
      flex-direction: column;
    }

    .feature-text strong {
      font-size: 0.95rem;
      color: #ffffff;
    }

    .feature-text span {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .showcase-footer {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Right Form */
    .login-form-section {
      flex: 0.9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--bg-app);
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
    }

    .login-header {
      margin-bottom: 24px;
    }

    .login-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .login-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .demo-box {
      margin-bottom: 24px;
      padding: 12px 14px;
      background: rgba(0, 242, 254, 0.05);
      border: 1px dashed rgba(0, 242, 254, 0.25);
      border-radius: var(--radius-md);
    }

    .demo-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-cyan);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .demo-buttons {
      display: flex;
      gap: 8px;
    }

    .password-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrap .form-control {
      padding-right: 44px;
    }

    .pwd-toggle-btn {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
    }

    .submit-btn {
      width: 100%;
      margin-top: 10px;
    }

    .login-card-footer {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .register-link {
      color: var(--primary-cyan);
      font-weight: 600;
    }

    @media (max-width: 992px) {
      .login-showcase { display: none; }
      .login-form-section { padding: 20px; }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  getFieldError(fieldName: 'email' | 'password'): string | null {
    const label = fieldName === 'email' ? 'Email address' : 'Password';
    return FormErrorUtil.getErrorMessage(this.form.get(fieldName), label);
  }

  fillDemo(email: string, pass: string): void {
    this.form.patchValue({ email, password: pass });
    this.form.markAsUntouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        FormErrorUtil.applyServerErrors(this.form, err);
      }
    });
  }
}
