import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-item toast-{{ toast.type }} animate-fade-in" role="alert">
          <div class="toast-indicator"></div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-message">{{ toast.message }}</div>
            }
          </div>
          <button class="toast-close" (click)="notificationService.remove(toast.id)" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      width: 100%;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 18px;
      background: rgba(15, 21, 35, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
      transition: all 0.25s ease;
    }

    .toast-indicator {
      width: 4px;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
    }

    .toast-success .toast-indicator { background: var(--color-success); box-shadow: 0 0 12px var(--color-success); }
    .toast-error .toast-indicator { background: var(--color-danger); box-shadow: 0 0 12px var(--color-danger); }
    .toast-warning .toast-indicator { background: var(--color-warning); box-shadow: 0 0 12px var(--color-warning); }
    .toast-info .toast-indicator { background: var(--color-info); box-shadow: 0 0 12px var(--color-info); }

    .toast-content {
      flex: 1;
      padding-left: 4px;
    }

    .toast-title {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.925rem;
      color: #ffffff;
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .toast-close:hover {
      color: #ffffff;
    }
  `]
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);
}
