import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BusinessType, TenantOnboardRequest } from '../../../core/models/auth.models';
import { FormErrorUtil } from '../../../core/util/form-error.util';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-onboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastContainerComponent],
  template: `
    <div class="onboard-layout">
      <header class="onboard-header">
        <a routerLink="/auth/login" class="brand-link">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">Pulse<span class="text-gradient">Gym</span></span>
        </a>
        <div class="header-right">
          <button type="button" class="theme-toggle-btn" (click)="themeService.toggleTheme()">
            <span>{{ themeService.isDarkMode() ? '☀️ Light' : '🌙 Dark' }}</span>
          </button>
          <span>Already registered?</span>
          <a routerLink="/auth/login" class="btn btn-secondary btn-sm">Sign In</a>
        </div>
      </header>

      <main class="onboard-container">
        <!-- Step Stepper -->
        <div class="stepper-bar">
          <div class="step-node" [class.step-active]="currentStep() >= 1" [class.step-completed]="currentStep() > 1">
            <div class="node-circle">1</div>
            <span class="node-label">Gym Details</span>
          </div>
          <div class="step-line" [class.line-active]="currentStep() > 1"></div>
          <div class="step-node" [class.step-active]="currentStep() >= 2" [class.step-completed]="currentStep() > 2">
            <div class="node-circle">2</div>
            <span class="node-label">Owner Profile</span>
          </div>
          <div class="step-line" [class.line-active]="currentStep() > 2"></div>
          <div class="step-node" [class.step-active]="currentStep() === 3">
            <div class="node-circle">3</div>
            <span class="node-label">Plan & Launch</span>
          </div>
        </div>

        <div class="wizard-card glass-card">
          <!-- STEP 1: Gym Details -->
          @if (currentStep() === 1) {
            <div class="step-panel animate-fade-in" [formGroup]="gymForm">
              <div class="step-heading">
                <h2>Tell us about your fitness facility</h2>
                <p>Enter your gym's official name, business category, and contact information.</p>
              </div>

              <div class="form-group">
                <label class="form-label">Gym / Facility Name *</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. Iron Forge Fitness"
                  formControlName="gymName"
                  [class.is-invalid]="getGymError('gymName')"
                />
                @if (getGymError('gymName'); as err) {
                  <span class="form-error">{{ err }}</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Business Type</label>
                <div class="category-grid">
                  @for (cat of businessTypes; track cat.type) {
                    <div
                      class="category-card"
                      [class.category-selected]="gymForm.get('businessType')?.value === cat.type"
                      (click)="gymForm.patchValue({ businessType: cat.type })"
                    >
                      <span class="cat-icon">{{ cat.icon }}</span>
                      <span class="cat-title">{{ cat.label }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Official Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="contact@ironforge.com"
                    formControlName="email"
                    [class.is-invalid]="getGymError('email')"
                  />
                  @if (getGymError('email'); as err) {
                    <span class="form-error">{{ err }}</span>
                  }
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Official Phone *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="9876543210"
                    formControlName="phone"
                    [class.is-invalid]="getGymError('phone')"
                  />
                  @if (getGymError('phone'); as err) {
                    <span class="form-error">{{ err }}</span>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-2">
                  <label class="form-label">Address</label>
                  <input type="text" class="form-control" placeholder="123 Main Street" formControlName="address" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">City</label>
                  <input type="text" class="form-control" placeholder="Bengaluru" formControlName="city" />
                </div>
              </div>

              <div class="wizard-actions">
                <div></div>
                <button type="button" class="btn btn-primary btn-lg" (click)="proceedStep1()">
                  Continue to Owner Profile →
                </button>
              </div>
            </div>
          }

          <!-- STEP 2: Owner Profile -->
          @if (currentStep() === 2) {
            <div class="step-panel animate-fade-in" [formGroup]="ownerForm">
              <div class="step-heading">
                <h2>Create your Master Administrator Account</h2>
                <p>This will be the primary GYM_OWNER account with full access to tenant management.</p>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">First Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="John"
                    formControlName="ownerFirstName"
                    [class.is-invalid]="getOwnerError('ownerFirstName')"
                  />
                  @if (getOwnerError('ownerFirstName'); as err) {
                    <span class="form-error">{{ err }}</span>
                  }
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Last Name</label>
                  <input type="text" class="form-control" placeholder="Doe" formControlName="ownerLastName" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Owner Login Email *</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="owner@domain.com"
                  formControlName="ownerEmail"
                  [class.is-invalid]="getOwnerError('ownerEmail')"
                />
                @if (getOwnerError('ownerEmail'); as err) {
                  <span class="form-error">{{ err }}</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Password * (min 6 characters)</label>
                <input
                  type="password"
                  class="form-control"
                  placeholder="••••••••"
                  formControlName="ownerPassword"
                  [class.is-invalid]="getOwnerError('ownerPassword')"
                />
                @if (getOwnerError('ownerPassword'); as err) {
                  <span class="form-error">{{ err }}</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Owner Mobile Phone</label>
                <input type="text" class="form-control" placeholder="9876543210" formControlName="ownerPhone" />
              </div>

              <div class="wizard-actions flex-between">
                <button type="button" class="btn btn-secondary" (click)="goToStep(1)">
                  ← Back
                </button>
                <button type="button" class="btn btn-primary btn-lg" (click)="proceedStep2()">
                  Review & Launch →
                </button>
              </div>
            </div>
          }

          <!-- STEP 3: Plan Preview & Confirmation -->
          @if (currentStep() === 3) {
            <div class="step-panel animate-fade-in">
              <div class="step-heading">
                <h2>Select SaaS Tier & Confirm Registration</h2>
                <p>Review your gym details. A 14-day free trial will be activated automatically.</p>
              </div>

              <!-- Plan Cards -->
              <div class="plans-grid">
                <div class="plan-card" [class.plan-selected]="selectedPlan() === 'STARTER'" (click)="selectedPlan.set('STARTER')">
                  <div class="plan-badge">POPULAR</div>
                  <div class="plan-name">Gym Starter</div>
                  <div class="plan-price">₹1,200<span>/month</span></div>
                  <ul class="plan-features">
                    <li>✓ Up to 300 active members</li>
                    <li>✓ 5 staff/trainer accounts</li>
                    <li>✓ Automated expiry scheduler</li>
                    <li>✓ WhatsApp & SMS renewal alerts</li>
                  </ul>
                </div>

                <div class="plan-card" [class.plan-selected]="selectedPlan() === 'PRO'" (click)="selectedPlan.set('PRO')">
                  <div class="plan-name">Gym Pro</div>
                  <div class="plan-price">₹2,400<span>/month</span></div>
                  <ul class="plan-features">
                    <li>✓ Up to 1,000 active members</li>
                    <li>✓ Unlimited staff & trainers</li>
                    <li>✓ Biometric & QR attendance</li>
                    <li>✓ Revenue analytics reports</li>
                  </ul>
                </div>
              </div>

              <!-- Summary Card -->
              <div class="summary-box">
                <div class="summary-row">
                  <span class="sum-label">Gym Facility:</span>
                  <span class="sum-val">{{ gymForm.get('gymName')?.value }} ({{ gymForm.get('businessType')?.value }})</span>
                </div>
                <div class="summary-row">
                  <span class="sum-label">Master Admin:</span>
                  <span class="sum-val">{{ ownerForm.get('ownerFirstName')?.value }} {{ ownerForm.get('ownerLastName')?.value }} ({{ ownerForm.get('ownerEmail')?.value }})</span>
                </div>
              </div>

              <div class="wizard-actions flex-between">
                <button type="button" class="btn btn-secondary" (click)="goToStep(2)">
                  ← Back
                </button>
                <button type="button" class="btn btn-primary btn-lg" [disabled]="isLoading()" (click)="submitOnboarding()">
                  @if (isLoading()) {
                    <span class="spinner"></span>
                    <span>Creating Tenant & Deploying...</span>
                  } @else {
                    <span>🚀 Launch Gym Instance</span>
                  }
                </button>
              </div>
            </div>
          }
        </div>
      </main>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .onboard-layout {
      min-height: 100vh;
      background: var(--bg-app);
      display: flex;
      flex-direction: column;
      transition: background-color var(--transition-normal);
    }

    .onboard-header {
      height: 70px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--accent-gradient);
      color: #04101e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 1.15rem;
    }

    .brand-name {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .onboard-container {
      flex: 1;
      max-width: 860px;
      width: 100%;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Stepper */
    .stepper-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .step-node {
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0.55;
      transition: opacity var(--transition-normal);
    }

    .step-active { opacity: 1; }

    .node-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    .step-active .node-circle {
      background: var(--accent-gradient);
      color: #04101e;
      border-color: transparent;
      box-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
    }

    .node-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .step-line {
      width: 60px;
      height: 2px;
      background: var(--border-subtle);
    }

    .line-active {
      background: var(--primary-cyan);
    }

    /* Wizard Card */
    .wizard-card {
      padding: 36px 40px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      backdrop-filter: var(--glass-blur);
    }

    .step-heading {
      margin-bottom: 28px;
    }

    .step-heading h2 {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .step-heading p {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    /* Category Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 10px;
      margin-top: 4px;
    }

    .category-card {
      padding: 14px 12px;
      border-radius: var(--radius-md);
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
    }

    .category-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }

    .category-selected {
      border-color: var(--primary-cyan) !important;
      background: rgba(0, 242, 254, 0.08) !important;
      box-shadow: 0 0 14px rgba(0, 242, 254, 0.2);
    }

    .cat-icon { font-size: 1.4rem; }
    .cat-title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }

    /* Plans Grid */
    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .plan-card {
      padding: 24px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      position: relative;
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .plan-card:hover {
      border-color: var(--border-hover);
    }

    .plan-selected {
      border-color: var(--primary-cyan) !important;
      background: rgba(0, 242, 254, 0.06) !important;
      box-shadow: 0 0 24px rgba(0, 242, 254, 0.25);
    }

    .plan-badge {
      position: absolute;
      top: -10px;
      right: 18px;
      padding: 3px 10px;
      background: var(--accent-gradient);
      color: #04101e;
      font-size: 0.65rem;
      font-weight: 800;
      border-radius: 999px;
    }

    .plan-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .plan-price {
      font-size: 1.8rem;
      font-weight: 900;
      color: var(--primary-cyan);
      margin-bottom: 16px;
    }

    .plan-price span {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 400;
    }

    .plan-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.825rem;
      color: var(--text-secondary);
    }

    .summary-box {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }

    .sum-label { color: var(--text-muted); }
    .sum-val { color: var(--text-primary); font-weight: 600; }

    .wizard-actions {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    @media (max-width: 768px) {
      .form-row { flex-direction: column; }
      .plans-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class OnboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly currentStep = signal<number>(1);
  readonly isLoading = signal<boolean>(false);
  readonly selectedPlan = signal<string>('STARTER');

  readonly businessTypes: { type: BusinessType; label: string; icon: string }[] = [
    { type: 'TRADITIONAL_GYM', label: 'Gym & Weights', icon: '🏋️' },
    { type: 'FITNESS_CENTER', label: 'Fitness Center', icon: '🏃' },
    { type: 'CROSSFIT', label: 'CrossFit Box', icon: '⚡' },
    { type: 'YOGA_STUDIO', label: 'Yoga & Pilates', icon: '🧘' },
    { type: 'MMA_MARTIAL_ARTS', label: 'MMA & Boxing', icon: '🥊' },
    { type: 'PERSONAL_TRAINING', label: 'Personal Studio', icon: '🎯' }
  ];

  readonly gymForm = this.fb.group({
    gymName: ['', [Validators.required]],
    businessType: ['TRADITIONAL_GYM' as BusinessType, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+ -]{7,15}$/)]],
    address: [''],
    city: ['']
  });

  readonly ownerForm = this.fb.group({
    ownerFirstName: ['', [Validators.required]],
    ownerLastName: [''],
    ownerEmail: ['', [Validators.required, Validators.email]],
    ownerPassword: ['', [Validators.required, Validators.minLength(6)]],
    ownerPhone: ['']
  });

  getGymError(field: 'gymName' | 'email' | 'phone'): string | null {
    const labels: Record<string, string> = {
      gymName: 'Gym facility name',
      email: 'Official email',
      phone: 'Contact phone'
    };
    return FormErrorUtil.getErrorMessage(this.gymForm.get(field), labels[field]);
  }

  getOwnerError(field: 'ownerFirstName' | 'ownerEmail' | 'ownerPassword'): string | null {
    const labels: Record<string, string> = {
      ownerFirstName: 'First name',
      ownerEmail: 'Owner email',
      ownerPassword: 'Password'
    };
    return FormErrorUtil.getErrorMessage(this.ownerForm.get(field), labels[field]);
  }

  proceedStep1(): void {
    if (this.gymForm.invalid) {
      this.gymForm.markAllAsTouched();
      return;
    }
    this.goToStep(2);
  }

  proceedStep2(): void {
    if (this.ownerForm.invalid) {
      this.ownerForm.markAllAsTouched();
      return;
    }
    this.goToStep(3);
  }

  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  submitOnboarding(): void {
    if (this.gymForm.invalid || this.ownerForm.invalid) return;

    this.isLoading.set(true);
    const gymData = this.gymForm.getRawValue();
    const ownerData = this.ownerForm.getRawValue();

    const payload: TenantOnboardRequest = {
      gymName: gymData.gymName!,
      businessType: gymData.businessType as BusinessType,
      email: gymData.email!,
      phone: gymData.phone!,
      address: gymData.address || undefined,
      city: gymData.city || undefined,
      ownerFirstName: ownerData.ownerFirstName!,
      ownerLastName: ownerData.ownerLastName || undefined,
      ownerEmail: ownerData.ownerEmail!,
      ownerPassword: ownerData.ownerPassword!,
      ownerPhone: ownerData.ownerPhone || undefined
    };

    this.authService.onboardGym(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const mappedGym = FormErrorUtil.applyServerErrors(this.gymForm, err);
        const mappedOwner = FormErrorUtil.applyServerErrors(this.ownerForm, err);

        const errMsg = err?.error?.error?.message || '';
        if (errMsg.toLowerCase().includes('owner email')) {
          this.ownerForm.get('ownerEmail')?.setErrors({ serverError: 'This email is already registered. Please use another email or sign in.' });
          this.ownerForm.get('ownerEmail')?.markAsTouched();
          this.goToStep(2);
        } else if (errMsg.toLowerCase().includes('gym') || errMsg.toLowerCase().includes('slug')) {
          this.gymForm.get('gymName')?.setErrors({ serverError: errMsg });
          this.gymForm.get('gymName')?.markAsTouched();
          this.goToStep(1);
        } else if (mappedGym) {
          this.goToStep(1);
        } else if (mappedOwner) {
          this.goToStep(2);
        }
      }
    });
  }
}
