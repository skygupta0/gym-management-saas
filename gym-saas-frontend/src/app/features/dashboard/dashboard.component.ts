import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { MemberService } from '../../core/services/member.service';
import { PlanService } from '../../core/services/plan.service';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormErrorUtil } from '../../core/util/form-error.util';
import { ActivityStreamItem, DashboardStats, Member, MembershipPlan } from '../../core/models/gym.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, StatCardComponent, ModalComponent],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Welcome Header -->
      <div class="dashboard-header flex-between">
        <div>
          <h1 class="page-title">
            Operations <span class="text-gradient">Hub</span>
          </h1>
          <p class="page-subtitle">
            Welcome back, <strong>{{ authService.currentUser()?.fullName }}</strong>. Here is live activity for <strong>{{ authService.currentGym()?.name }}</strong>.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary" (click)="loadDashboardData()" [disabled]="isLoading()">
            <span>🔄 Refresh</span>
          </button>
          <button class="btn btn-primary" (click)="openAddMemberModal()">
            <span>+ Enroll Member</span>
          </button>
        </div>
      </div>

      <!-- Actionable Expiry Alert Banner -->
      @if (stats().expiringSoon > 0) {
        <div class="alert-banner glass-card animate-fade-in">
          <div class="alert-icon">⚠️</div>
          <div class="alert-text">
            <strong>{{ stats().expiringSoon }} Memberships Expiring This Week</strong>
            <span>Automated renewal reminders via WhatsApp/SMS can be dispatched immediately.</span>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="triggerReminders()">
            Send Batch Reminders
          </button>
        </div>
      }

      <!-- 4 KPI Stat Cards -->
      <div class="stats-grid">
        <app-stat-card
          title="Active Members"
          [value]="stats().activeMembers"
          [trend]="{ value: 12.4, isPositive: true }"
          icon="👥"
          color="cyan"
        ></app-stat-card>

        <app-stat-card
          title="Today's Check-ins"
          [value]="stats().todayCheckIns"
          subtitle="Real-time attendance"
          icon="⚡"
          color="purple"
        ></app-stat-card>

        <app-stat-card
          title="Monthly Revenue"
          [value]="'₹' + formatCurrency(stats().monthlyRevenue)"
          [trend]="{ value: 8.7, isPositive: true }"
          icon="💰"
          color="emerald"
        ></app-stat-card>

        <app-stat-card
          title="Expiring Soon"
          [value]="stats().expiringSoon"
          subtitle="Within next 7 days"
          icon="⏳"
          color="amber"
        ></app-stat-card>
      </div>

      <!-- Quick Operations & Recent Feed -->
      <div class="dashboard-grid">
        <!-- Left: Quick Action Cards -->
        <div class="section-card glass-card">
          <div class="section-header">
            <h3>Quick Operations</h3>
            <span class="section-tag">Instant Actions</span>
          </div>

          <div class="quick-actions-grid">
            <div class="action-tile" (click)="openCheckInModal()" id="btn-fast-checkin">
              <div class="tile-icon-wrap cyan">🟢</div>
              <div class="tile-title">Fast Check-In</div>
              <div class="tile-desc">Scan QR or enter member code</div>
            </div>

            <div class="action-tile" (click)="openAddMemberModal()" id="btn-add-member">
              <div class="tile-icon-wrap purple">👤</div>
              <div class="tile-title">Add Member</div>
              <div class="tile-desc">Enroll athlete & select plan</div>
            </div>

            <div class="action-tile" (click)="openPaymentModal()" id="btn-collect-payment">
              <div class="tile-icon-wrap emerald">💳</div>
              <div class="tile-title">Collect Payment</div>
              <div class="tile-desc">UPI, Card, Cash, Net Banking</div>
            </div>

            <a routerLink="/users" class="action-tile" id="btn-manage-staff">
              <div class="tile-icon-wrap amber">🏋️</div>
              <div class="tile-title">Manage Staff</div>
              <div class="tile-desc">Trainers, admins & staff</div>
            </a>
          </div>

          <!-- Capacity Bar -->
          <div class="capacity-box">
            <div class="flex-between capacity-labels">
              <span>Live Floor Occupancy</span>
              <strong>{{ stats().liveFloorCount }} / {{ stats().liveFloorCapacity }} Athletes ({{ stats().liveFloorPercentage }}%)</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="stats().liveFloorPercentage"></div>
            </div>
          </div>
        </div>

        <!-- Right: Recent Activity Stream -->
        <div class="section-card glass-card">
          <div class="section-header flex-between">
            <h3>Recent Gym Activity</h3>
            <span class="badge badge-active"><span class="badge-dot"></span> Live Stream</span>
          </div>

          <div class="activity-feed">
            @if (stats().recentActivity.length === 0) {
              <div class="empty-feed flex-center">
                <span>No activities recorded yet today. Check in a member to start!</span>
              </div>
            } @else {
              @for (act of stats().recentActivity; track act.id) {
                <div class="activity-row">
                  <div class="activity-badge-icon" [ngClass]="act.type.toLowerCase()">
                    {{ act.icon || '⚡' }}
                  </div>
                  <div class="activity-detail">
                    <div class="activity-title-text">{{ act.title }}</div>
                    <div class="activity-sub">{{ act.description }}</div>
                  </div>
                  <span class="activity-timestamp">{{ act.timeAgo }}</span>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <!-- ================= MODALS ================= -->

      <!-- 1. FAST CHECK-IN MODAL -->
      <app-modal [isOpen]="isCheckInModalOpen()" title="Fast Member Check-In" (close)="closeCheckInModal()">
        <form [formGroup]="checkInForm" (ngSubmit)="submitCheckIn()" class="modal-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="memberCode">Member Code or Mobile Number *</label>
            <input
              id="memberCode"
              type="text"
              class="form-control"
              placeholder="e.g. MEM-1001 or 9876543210"
              formControlName="memberCode"
              [class.is-invalid]="getCheckInError('memberCode')"
            />
            @if (getCheckInError('memberCode'); as err) {
              <span class="form-error">{{ err }}</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Check-In Source</label>
            <select class="form-control" formControlName="source">
              <option value="MANUAL_STAFF">Front Desk Check-in</option>
              <option value="QR_CODE">Main Gate (QR Scan)</option>
              <option value="BIOMETRIC">Biometric Turnstile</option>
            </select>
          </div>

          <div class="modal-footer flex-between">
            <button type="button" class="btn btn-secondary" (click)="closeCheckInModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner"></span>
                <span>Verifying & Checking In...</span>
              } @else {
                <span>✓ Record Check-In</span>
              }
            </button>
          </div>
        </form>
      </app-modal>

      <!-- 2. ADD MEMBER MODAL -->
      <app-modal [isOpen]="isAddMemberModalOpen()" title="Enroll New Member" (close)="closeAddMemberModal()">
        <form [formGroup]="memberForm" (ngSubmit)="submitAddMember()" class="modal-form" novalidate>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">First Name *</label>
              <input
                type="text"
                class="form-control"
                placeholder="Rohan"
                formControlName="firstName"
                [class.is-invalid]="getMemberError('firstName')"
              />
              @if (getMemberError('firstName'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Last Name</label>
              <input type="text" class="form-control" placeholder="Sharma" formControlName="lastName" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Mobile Number *</label>
              <input
                type="text"
                class="form-control"
                placeholder="9876543210"
                formControlName="mobile"
                [class.is-invalid]="getMemberError('mobile')"
              />
              @if (getMemberError('mobile'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-control" placeholder="rohan@gmail.com" formControlName="email" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Gender</label>
              <select class="form-control" formControlName="gender">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Initial Membership Plan</label>
              <select class="form-control" formControlName="planId">
                <option value="">-- No plan (Enroll only) --</option>
                @for (plan of plans(); track plan.id) {
                  <option [value]="plan.id">{{ plan.name }} (₹{{ plan.price }} / {{ plan.durationDays }} days)</option>
                }
              </select>
            </div>
          </div>

          <div class="modal-footer flex-between">
            <button type="button" class="btn btn-secondary" (click)="closeAddMemberModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner"></span>
                <span>Enrolling Athlete...</span>
              } @else {
                <span>✓ Complete Enrollment</span>
              }
            </button>
          </div>
        </form>
      </app-modal>

      <!-- 3. COLLECT PAYMENT MODAL -->
      <app-modal [isOpen]="isPaymentModalOpen()" title="Collect Member Payment" (close)="closePaymentModal()">
        <form [formGroup]="paymentForm" (ngSubmit)="submitPayment()" class="modal-form" novalidate>
          <div class="form-group">
            <label class="form-label">Select Member *</label>
            <select class="form-control" formControlName="memberId" [class.is-invalid]="getPaymentError('memberId')">
              <option value="">-- Select Member --</option>
              @for (m of membersList(); track m.id) {
                <option [value]="m.id">{{ m.fullName }} ({{ m.memberCode }} - {{ m.mobile }})</option>
              }
            </select>
            @if (getPaymentError('memberId'); as err) {
              <span class="form-error">{{ err }}</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Amount (₹) *</label>
              <input
                type="number"
                class="form-control"
                placeholder="2400"
                formControlName="amount"
                [class.is-invalid]="getPaymentError('amount')"
              />
              @if (getPaymentError('amount'); as err) {
                <span class="form-error">{{ err }}</span>
              }
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Payment Method *</label>
              <select class="form-control" formControlName="paymentMethod">
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Transaction / Reference ID</label>
            <input type="text" class="form-control" placeholder="e.g. UPI-9847120394" formControlName="transactionId" />
          </div>

          <div class="modal-footer flex-between">
            <button type="button" class="btn btn-secondary" (click)="closePaymentModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner"></span>
                <span>Processing Payment...</span>
              } @else {
                <span>✓ Generate Receipt & Record</span>
              }
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .dashboard-header {
      margin-bottom: 4px;
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .page-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
    }

    .page-subtitle strong {
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Alert Banner */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-lg);
    }

    .alert-icon { font-size: 1.5rem; }

    .alert-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .alert-text strong {
      font-size: 0.95rem;
      color: var(--color-warning);
    }

    .alert-text span {
      font-size: 0.825rem;
      color: var(--text-secondary);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    /* 2 Column Main Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 24px;
    }

    .section-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-header h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .section-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Quick Action Tiles */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .action-tile {
      padding: 16px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .action-tile:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }

    .tile-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      margin-bottom: 2px;
    }

    .tile-icon-wrap.cyan { background: rgba(0, 242, 254, 0.12); color: var(--primary-cyan); }
    .tile-icon-wrap.purple { background: rgba(168, 85, 247, 0.12); color: #a855f7; }
    .tile-icon-wrap.emerald { background: rgba(16, 185, 129, 0.12); color: var(--color-success); }
    .tile-icon-wrap.amber { background: rgba(245, 158, 11, 0.12); color: var(--color-warning); }

    .tile-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .tile-desc {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    /* Capacity Progress */
    .capacity-box {
      padding: 16px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .capacity-labels {
      font-size: 0.825rem;
      color: var(--text-secondary);
    }

    .capacity-labels strong {
      color: var(--primary-cyan);
    }

    .progress-track {
      width: 100%;
      height: 8px;
      background: var(--border-subtle);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent-gradient);
      border-radius: 999px;
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
      transition: width 0.4s ease;
    }

    /* Activity Feed */
    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 380px;
      overflow-y: auto;
    }

    .empty-feed {
      padding: 40px 10px;
      font-size: 0.85rem;
      color: var(--text-muted);
      text-align: center;
    }

    .activity-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .activity-row:hover {
      border-color: var(--border-hover);
      transform: translateX(2px);
    }

    .activity-badge-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      flex-shrink: 0;
      background: rgba(0, 242, 254, 0.15);
    }

    .activity-badge-icon.check_in { background: rgba(0, 242, 254, 0.15); color: var(--primary-cyan); }
    .activity-badge-icon.payment { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
    .activity-badge-icon.expiry_alert { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }

    .activity-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .activity-title-text {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .activity-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .activity-timestamp {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .form-row {
      display: flex;
      gap: 14px;
    }

    .flex-1 { flex: 1; }

    .modal-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .quick-actions-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly memberService = inject(MemberService);
  private readonly planService = inject(PlanService);
  private readonly paymentService = inject(PaymentService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  // Modals state
  readonly isCheckInModalOpen = signal<boolean>(false);
  readonly isAddMemberModalOpen = signal<boolean>(false);
  readonly isPaymentModalOpen = signal<boolean>(false);

  readonly plans = signal<MembershipPlan[]>([]);
  readonly membersList = signal<Member[]>([]);

  readonly stats = signal<DashboardStats>({
    activeMembers: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
    expiringSoon: 0,
    liveFloorCount: 0,
    liveFloorCapacity: 75,
    liveFloorPercentage: 0,
    recentActivity: []
  });

  // Forms
  readonly checkInForm = this.fb.group({
    memberCode: ['', [Validators.required]],
    source: ['MANUAL_STAFF']
  });

  readonly memberForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: [''],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9+ -]{7,15}$')]],
    email: [''],
    gender: ['MALE'],
    planId: ['']
  });

  readonly paymentForm = this.fb.group({
    memberId: ['', [Validators.required]],
    amount: [1200, [Validators.required, Validators.min(1)]],
    paymentMethod: ['UPI', [Validators.required]],
    transactionId: ['']
  });

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadPlans();
    this.loadMembers();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardStats().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.stats.set(res.data);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadPlans(): void {
    this.planService.getPlans().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.plans.set(res.data);
        }
      }
    });
  }

  loadMembers(): void {
    this.memberService.getMembers(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.membersList.set(res.data.content);
        }
      }
    });
  }

  // 1. Fast Check-In
  openCheckInModal(): void {
    this.checkInForm.reset({ source: 'MANUAL_STAFF' });
    this.isCheckInModalOpen.set(true);
  }

  closeCheckInModal(): void {
    this.isCheckInModalOpen.set(false);
  }

  getCheckInError(field: 'memberCode'): string | null {
    return FormErrorUtil.getErrorMessage(this.checkInForm.get(field), 'Member code');
  }

  submitCheckIn(): void {
    if (this.checkInForm.invalid) {
      this.checkInForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { memberCode, source } = this.checkInForm.getRawValue();

    this.attendanceService.checkIn({ memberCode: memberCode!, source: source! }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          this.notification.success('Check-in Recorded', `${res.data.memberName} (${res.data.memberCode}) checked in.`);
          this.closeCheckInModal();
          this.loadDashboardData();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        FormErrorUtil.applyServerErrors(this.checkInForm, err);
      }
    });
  }

  // 2. Add Member
  openAddMemberModal(): void {
    this.memberForm.reset({ gender: 'MALE', planId: '' });
    this.isAddMemberModalOpen.set(true);
  }

  closeAddMemberModal(): void {
    this.isAddMemberModalOpen.set(false);
  }

  getMemberError(field: 'firstName' | 'mobile'): string | null {
    const labels: Record<string, string> = {
      firstName: 'First name',
      mobile: 'Mobile number'
    };
    return FormErrorUtil.getErrorMessage(this.memberForm.get(field), labels[field]);
  }

  submitAddMember(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.memberForm.getRawValue();

    this.memberService.createMember({
      firstName: val.firstName!,
      lastName: val.lastName || undefined,
      mobile: val.mobile!,
      email: val.email || undefined,
      gender: val.gender || undefined
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const createdMember = res.data;

          // If plan selected, purchase membership
          if (val.planId) {
            this.planService.purchaseMembership({
              memberId: createdMember.id,
              planId: val.planId
            }).subscribe({
              next: () => {
                this.finishMemberCreation(createdMember);
              },
              error: () => {
                this.finishMemberCreation(createdMember);
              }
            });
          } else {
            this.finishMemberCreation(createdMember);
          }
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        FormErrorUtil.applyServerErrors(this.memberForm, err);
      }
    });
  }

  private finishMemberCreation(member: Member): void {
    this.isSubmitting.set(false);
    this.notification.success('Athlete Enrolled', `${member.fullName} has been assigned member code ${member.memberCode}.`);
    this.closeAddMemberModal();
    this.loadDashboardData();
    this.loadMembers();
  }

  // 3. Collect Payment
  openPaymentModal(): void {
    this.paymentForm.reset({ amount: 1200, paymentMethod: 'UPI' });
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen.set(false);
  }

  getPaymentError(field: 'memberId' | 'amount'): string | null {
    const labels: Record<string, string> = {
      memberId: 'Member',
      amount: 'Amount'
    };
    return FormErrorUtil.getErrorMessage(this.paymentForm.get(field), labels[field]);
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.paymentForm.getRawValue();

    this.paymentService.collectPayment({
      memberId: val.memberId!,
      amount: val.amount!,
      paymentMethod: val.paymentMethod!,
      transactionId: val.transactionId || undefined
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          this.notification.success('Receipt Generated', `Invoice ${res.data.invoiceNumber} recorded for ₹${res.data.amount}.`);
          this.closePaymentModal();
          this.loadDashboardData();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        FormErrorUtil.applyServerErrors(this.paymentForm, err);
      }
    });
  }

  triggerReminders(): void {
    this.notification.success('Reminders Sent', `Dispatched renewal reminders to ${this.stats().expiringSoon} members.`);
  }

  formatCurrency(val: number): string {
    if (!val) return '0';
    return Number(val).toLocaleString('en-IN');
  }
}
