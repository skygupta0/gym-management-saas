import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { NotificationService } from '../../core/services/notification.service';

interface ActivityItem {
  id: string;
  type: 'CHECKIN' | 'PAYMENT' | 'EXPIRY' | 'NEW_MEMBER';
  title: string;
  subtitle: string;
  time: string;
  badge: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Welcome Header -->
      <div class="dashboard-header flex-between">
        <div>
          <h1 class="page-title">
            Operations <span class="text-gradient">Hub</span>
          </h1>
          <p class="page-subtitle">
            Welcome back, <strong>{{ authService.currentUser()?.fullName }}</strong>. Here is today's overview for <strong>{{ authService.currentGym()?.name }}</strong>.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshMetrics()">
            <span>🔄 Refresh</span>
          </button>
          <a routerLink="/users" class="btn btn-primary">
            <span>+ Add Staff</span>
          </a>
        </div>
      </div>

      <!-- Actionable Expiry Alert Banner -->
      <div class="alert-banner glass-card">
        <div class="alert-icon">⚠️</div>
        <div class="alert-text">
          <strong>12 Memberships Expiring This Week</strong>
          <span>Automated renewal reminders via WhatsApp/SMS are queued by the scheduled expiry engine.</span>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="triggerReminders()">
          Send Batch Reminders
        </button>
      </div>

      <!-- 4 KPI Stat Cards -->
      <div class="stats-grid">
        <app-stat-card
          title="Active Members"
          [value]="284"
          [trend]="{ value: 12.4, isPositive: true }"
          icon="👥"
          color="cyan"
        ></app-stat-card>

        <app-stat-card
          title="Today's Check-ins"
          [value]="68"
          subtitle="Peak hour: 6:00 PM - 8:30 PM"
          icon="⚡"
          color="purple"
        ></app-stat-card>

        <app-stat-card
          title="Monthly Revenue"
          value="₹3,48,000"
          [trend]="{ value: 8.7, isPositive: true }"
          icon="💰"
          color="emerald"
        ></app-stat-card>

        <app-stat-card
          title="Expiring Soon"
          [value]="12"
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
            <div class="action-tile" (click)="simulateAction('Member Check-in Recorded')">
              <div class="tile-icon-wrap cyan">🟢</div>
              <div class="tile-title">Fast Check-In</div>
              <div class="tile-desc">Scan QR or enter member code</div>
            </div>

            <div class="action-tile" (click)="simulateAction('New Member Registration opened')">
              <div class="tile-icon-wrap purple">👤</div>
              <div class="tile-title">Add Member</div>
              <div class="tile-desc">Enroll athlete & select plan</div>
            </div>

            <div class="action-tile" (click)="simulateAction('Payment Collection opened')">
              <div class="tile-icon-wrap emerald">💳</div>
              <div class="tile-title">Collect Payment</div>
              <div class="tile-desc">UPI, Card, Cash, Net Banking</div>
            </div>

            <a routerLink="/users" class="action-tile">
              <div class="tile-icon-wrap amber">🏋️</div>
              <div class="tile-title">Manage Staff</div>
              <div class="tile-desc">Trainers, admins & staff</div>
            </a>
          </div>

          <!-- Capacity Bar -->
          <div class="capacity-box">
            <div class="flex-between capacity-labels">
              <span>Live Floor Occupancy</span>
              <strong>42 / 75 Athletes (56%)</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: 56%"></div>
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
            @for (act of activities(); track act.id) {
              <div class="activity-row">
                <div class="activity-badge-icon" [ngClass]="act.type.toLowerCase()">
                  @switch (act.type) {
                    @case ('CHECKIN') { ⚡ }
                    @case ('PAYMENT') { 💰 }
                    @case ('EXPIRY') { ⏳ }
                    @case ('NEW_MEMBER') { 🌟 }
                  }
                </div>
                <div class="activity-detail">
                  <div class="activity-title-text">{{ act.title }}</div>
                  <div class="activity-sub">{{ act.subtitle }}</div>
                </div>
                <span class="activity-timestamp">{{ act.time }}</span>
              </div>
            }
          </div>
        </div>
      </div>
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
    }

    /* Activity Feed */
    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
    }

    .activity-badge-icon.checkin { background: rgba(0, 242, 254, 0.15); }
    .activity-badge-icon.payment { background: rgba(16, 185, 129, 0.15); }
    .activity-badge-icon.expiry { background: rgba(245, 158, 11, 0.15); }
    .activity-badge-icon.new_member { background: rgba(168, 85, 247, 0.15); }

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
export class DashboardComponent {
  readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly activities = signal<ActivityItem[]>([
    { id: '1', type: 'CHECKIN', title: 'Vikram Seth', subtitle: 'Checked in at Main Gate (QR Scan)', time: '2 mins ago', badge: 'Check-in' },
    { id: '2', type: 'PAYMENT', title: 'Rohan Sharma', subtitle: 'Paid ₹3,600 (Quarterly Plan Renewal)', time: '14 mins ago', badge: 'UPI' },
    { id: '3', type: 'NEW_MEMBER', title: 'Pooja Hegde', subtitle: 'Enrolled under Annual Pro Plan', time: '1 hr ago', badge: 'New Member' },
    { id: '4', type: 'EXPIRY', title: 'Aakash Verma', subtitle: 'Plan expiring in 2 days — Reminder Sent', time: '3 hrs ago', badge: 'Alert' },
    { id: '5', type: 'CHECKIN', title: 'Sneha Patel', subtitle: 'Checked in at Main Gate', time: '4 hrs ago', badge: 'Check-in' }
  ]);

  refreshMetrics(): void {
    this.notification.info('Dashboard Refreshed', 'Live metrics synchronized with PostgreSQL.');
  }

  triggerReminders(): void {
    this.notification.success('Reminders Sent', 'Dispatched WhatsApp/SMS renewal links to 12 members.');
  }

  simulateAction(message: string): void {
    this.notification.info('Action Triggered', message);
  }
}
