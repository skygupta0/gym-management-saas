import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card glass-card color-{{ color() }}">
      <div class="stat-header">
        <span class="stat-title">{{ title() }}</span>
        <div class="stat-icon-wrapper">
          <span class="stat-icon">{{ icon() }}</span>
        </div>
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ value() }}</div>
        @if (trend(); as tr) {
          <div class="stat-trend" [class.trend-up]="tr.isPositive" [class.trend-down]="!tr.isPositive">
            <span class="trend-arrow">{{ tr.isPositive ? '↑' : '↓' }}</span>
            <span class="trend-text">{{ tr.value }}% vs last month</span>
          </div>
        } @else if (subtitle()) {
          <div class="stat-subtitle">{{ subtitle() }}</div>
        }
      </div>
      <div class="stat-glow"></div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 22px 24px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-title {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      letter-spacing: 0.02em;
    }

    .stat-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      font-size: 1.25rem;
    }

    .stat-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-value {
      font-family: var(--font-heading);
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.775rem;
      font-weight: 600;
    }

    .trend-up { color: var(--color-success); }
    .trend-down { color: var(--color-danger); }

    .stat-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .stat-glow {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.15;
      pointer-events: none;
    }

    .color-cyan .stat-icon-wrapper { color: var(--primary-cyan); border-color: rgba(0, 242, 254, 0.2); }
    .color-cyan .stat-glow { background: var(--primary-cyan); }

    .color-purple .stat-icon-wrapper { color: #a855f7; border-color: rgba(168, 85, 247, 0.2); }
    .color-purple .stat-glow { background: #a855f7; }

    .color-emerald .stat-icon-wrapper { color: var(--color-success); border-color: rgba(16, 185, 129, 0.2); }
    .color-emerald .stat-glow { background: var(--color-success); }

    .color-amber .stat-icon-wrapper { color: var(--color-warning); border-color: rgba(245, 158, 11, 0.2); }
    .color-amber .stat-glow { background: var(--color-warning); }
  `]
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtitle = input<string>();
  readonly trend = input<{ value: number; isPositive: boolean }>();
  readonly icon = input<string>('⚡');
  readonly color = input<'cyan' | 'purple' | 'emerald' | 'amber' | 'rose'>('cyan');
}
