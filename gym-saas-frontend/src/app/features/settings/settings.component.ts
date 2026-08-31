import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymService, TenantUpdateRequest } from '../../core/services/gym.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tenant } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';
import { FormErrorUtil } from '../../core/util/form-error.util';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-page animate-fade-in">
      <div class="settings-header">
        <h1 class="page-title">Gym <span class="text-gradient">Settings</span></h1>
        <p class="page-subtitle">Configure your gym facility profile, address, operating currency, and brand details.</p>
      </div>

      @if (isLoading()) {
        <div class="loading-box flex-center">
          <span class="spinner"></span>
          <span>Loading gym settings...</span>
        </div>
      } @else {
        <div class="settings-grid">
          <!-- Main Form Card -->
          <div class="settings-card glass-card">
            <form [formGroup]="gymForm" (ngSubmit)="onSaveSettings()" novalidate>
              <div class="section-title">Facility Information</div>

              <div class="form-row">
                <div class="form-group flex-2">
                  <label class="form-label">Gym / Business Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="name"
                    [class.is-invalid]="getFieldError('name')"
                  />
                  @if (getFieldError('name'); as err) {
                    <span class="form-error">{{ err }}</span>
                  }
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Tenant Slug (Immutable)</label>
                  <input type="text" class="form-control disabled-input" [value]="gymProfile()?.slug" disabled />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Facility Email</label>
                  <input type="email" class="form-control disabled-input" [value]="gymProfile()?.email" disabled />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Contact Phone</label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="phone"
                    [class.is-invalid]="getFieldError('phone')"
                  />
                  @if (getFieldError('phone'); as err) {
                    <span class="form-error">{{ err }}</span>
                  }
                </div>
              </div>

              <div class="section-title" style="margin-top: 24px;">Location & Address</div>

              <div class="form-group">
                <label class="form-label">Street Address</label>
                <input type="text" class="form-control" formControlName="address" />
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">City</label>
                  <input type="text" class="form-control" formControlName="city" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">State</label>
                  <input type="text" class="form-control" formControlName="state" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Pincode</label>
                  <input type="text" class="form-control" formControlName="pincode" />
                </div>
              </div>

              <div class="section-title" style="margin-top: 24px;">Localization</div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Billing Currency</label>
                  <select class="form-control" formControlName="currency">
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Operating Timezone</label>
                  <select class="form-control" formControlName="timezone">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                    <option value="UTC">UTC (Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-lg" [disabled]="isSaving()">
                  @if (isSaving()) {
                    <span class="spinner"></span>
                    <span>Saving Changes...</span>
                  } @else {
                    <span>Save Profile Changes</span>
                  }
                </button>
              </div>
            </form>
          </div>

          <!-- Subscription Badge Card -->
          <div class="sub-info-card glass-card">
            <div class="sub-header">
              <h3>SaaS Subscription</h3>
              <span class="badge badge-active"><span class="badge-dot"></span> TRIAL ACTIVE</span>
            </div>

            <div class="sub-tier-name">Gym Starter Plan</div>
            <div class="sub-price">₹1,200 <span>/ month</span></div>

            <div class="sub-specs">
              <div class="spec-item">
                <span class="spec-label">Member Capacity:</span>
                <span class="spec-val">Up to 300</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Staff Limit:</span>
                <span class="spec-val">Up to 5</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Auto-Expiry Scheduler:</span>
                <span class="spec-val">Enabled (Daily 01:00 AM)</span>
              </div>
            </div>

            <div class="sub-footer">
              <span>Next billing period starts automatically after trial.</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .loading-box {
      padding: 60px;
      gap: 12px;
      color: var(--text-muted);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
      align-items: start;
    }

    .settings-card {
      padding: 28px 32px;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .disabled-input {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(0, 0, 0, 0.2);
    }

    .form-actions {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid var(--border-subtle);
    }

    /* Subscription Card */
    .sub-info-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sub-header h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }

    .sub-tier-name {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--primary-cyan);
    }

    .sub-price {
      font-size: 1.8rem;
      font-weight: 900;
      color: #ffffff;
    }

    .sub-price span {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 400;
    }

    .sub-specs {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px 0;
      border-top: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
    }

    .spec-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }

    .spec-label { color: var(--text-muted); }
    .spec-val { color: #ffffff; font-weight: 600; }

    .sub-footer {
      font-size: 0.775rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    @media (max-width: 992px) {
      .settings-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly gymService = inject(GymService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly gymProfile = signal<Tenant | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);

  readonly gymForm = this.fb.group({
    name: ['', [Validators.required]],
    phone: [''],
    address: [''],
    city: [''],
    state: [''],
    pincode: [''],
    currency: ['INR'],
    timezone: ['Asia/Kolkata']
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  getFieldError(field: 'name' | 'phone'): string | null {
    const labels: Record<string, string> = {
      name: 'Gym facility name',
      phone: 'Contact phone'
    };
    return FormErrorUtil.getErrorMessage(this.gymForm.get(field), labels[field]);
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.gymService.getGymProfile().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.gymProfile.set(res.data);
          this.gymForm.patchValue({
            name: res.data.name,
            phone: res.data.phone || '',
            address: res.data.address || '',
            city: res.data.city || '',
            state: res.data.state || '',
            pincode: res.data.pincode || '',
            currency: res.data.currency || 'INR',
            timezone: res.data.timezone || 'Asia/Kolkata'
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSaveSettings(): void {
    if (this.gymForm.invalid) {
      this.gymForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.gymForm.getRawValue();

    const payload: TenantUpdateRequest = {
      name: formVal.name!,
      phone: formVal.phone || undefined,
      address: formVal.address || undefined,
      city: formVal.city || undefined,
      state: formVal.state || undefined,
      pincode: formVal.pincode || undefined,
      currency: formVal.currency || undefined,
      timezone: formVal.timezone || undefined
    };

    this.gymService.updateGymProfile(payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success && res.data) {
          this.gymProfile.set(res.data);
          this.authService.currentGym.set({ name: res.data.name, slug: res.data.slug });
          this.notification.success('Settings Saved', 'Gym profile updated successfully.');
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        FormErrorUtil.applyServerErrors(this.gymForm, err);
      }
    });
  }
}
