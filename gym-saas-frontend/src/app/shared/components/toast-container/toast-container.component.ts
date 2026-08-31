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
        <div class="toast-item toast-{{ toast.type }}" role="alert">
          <!-- Status Icon Badge -->
          <div class="toast-icon-wrap">
            @switch (toast.type) {
              @case ('error') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @case ('success') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
              @case ('warning') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
              @case ('info') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
            }
          </div>

          <!-- Message Body -->
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="toast-message">{{ toast.message }}</div>
            }
          </div>

          <!-- Close Button -->
          <button class="toast-close" (click)="notificationService.remove(toast.id)" aria-label="Dismiss notification">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      width: calc(100% - 48px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 18px;
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: hidden;
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: all 0.25s ease;
      border: 1px solid transparent;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(40px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    /* Dark Mode Theme */
    body.dark-theme .toast-item {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
    }

    body.dark-theme .toast-title {
      color: #ffffff;
    }

    body.dark-theme .toast-message {
      color: #94a3b8;
    }

    body.dark-theme .toast-close {
      color: #64748b;
    }

    body.dark-theme .toast-close:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Light Mode Theme */
    body.light-theme .toast-item {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.08);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    body.light-theme .toast-title {
      color: #0f172a;
    }

    body.light-theme .toast-message {
      color: #475569;
    }

    body.light-theme .toast-close {
      color: #94a3b8;
    }

    body.light-theme .toast-close:hover {
      color: #0f172a;
      background: #f1f5f9;
    }

    /* Status Colors */
    .toast-error {
      border-left: 5px solid var(--color-danger) !important;
    }
    .toast-error .toast-icon-wrap {
      background: rgba(244, 63, 94, 0.12);
      color: var(--color-danger);
    }

    .toast-success {
      border-left: 5px solid var(--color-success) !important;
    }
    .toast-success .toast-icon-wrap {
      background: rgba(16, 185, 129, 0.12);
      color: var(--color-success);
    }

    .toast-warning {
      border-left: 5px solid var(--color-warning) !important;
    }
    .toast-warning .toast-icon-wrap {
      background: rgba(245, 158, 11, 0.12);
      color: var(--color-warning);
    }

    .toast-info {
      border-left: 5px solid var(--color-info) !important;
    }
    .toast-info .toast-icon-wrap {
      background: rgba(56, 189, 248, 0.12);
      color: var(--color-info);
    }

    /* Icon Wrap */
    .toast-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Body */
    .toast-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .toast-title {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }

    .toast-message {
      font-size: 0.85rem;
      line-height: 1.45;
      word-break: break-word;
    }

    /* Close */
    .toast-close {
      background: transparent;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
  `]
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);
}
