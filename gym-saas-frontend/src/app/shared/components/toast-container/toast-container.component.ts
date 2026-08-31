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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @case ('success') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
              @case ('warning') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
              @case ('info') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
      top: 76px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
      width: calc(100% - 48px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      position: relative;
      overflow: hidden;
      animation: toastSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: all 0.2s ease;
      opacity: 1;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Light Theme - 100% Solid Opaque Pure White */
    body.light-theme .toast-item {
      background-color: #ffffff !important;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    body.light-theme .toast-title {
      color: #0f172a !important;
    }

    body.light-theme .toast-message {
      color: #475569 !important;
    }

    body.light-theme .toast-close {
      color: #94a3b8;
    }

    body.light-theme .toast-close:hover {
      color: #0f172a;
      background-color: #f1f5f9;
    }

    /* Dark Theme - 100% Solid Opaque Slate/Navy */
    body.dark-theme .toast-item {
      background-color: #0f172a !important;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.6);
    }

    body.dark-theme .toast-title {
      color: #f8fafc !important;
    }

    body.dark-theme .toast-message {
      color: #94a3b8 !important;
    }

    body.dark-theme .toast-close {
      color: #64748b;
    }

    body.dark-theme .toast-close:hover {
      color: #f8fafc;
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Status Color Variants */
    .toast-error {
      border-left: 4px solid var(--color-danger) !important;
    }
    .toast-error .toast-icon-wrap {
      background: rgba(244, 63, 94, 0.14);
      color: var(--color-danger);
    }

    .toast-success {
      border-left: 4px solid var(--color-success) !important;
    }
    .toast-success .toast-icon-wrap {
      background: rgba(16, 185, 129, 0.14);
      color: var(--color-success);
    }

    .toast-warning {
      border-left: 4px solid var(--color-warning) !important;
    }
    .toast-warning .toast-icon-wrap {
      background: rgba(245, 158, 11, 0.14);
      color: var(--color-warning);
    }

    .toast-info {
      border-left: 4px solid var(--color-info) !important;
    }
    .toast-info .toast-icon-wrap {
      background: rgba(56, 189, 248, 0.14);
      color: var(--color-info);
    }

    /* Icon Wrap */
    .toast-icon-wrap {
      width: 32px;
      height: 32px;
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
      gap: 2px;
      min-width: 0;
    }

    .toast-title {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.9rem;
      line-height: 1.3;
    }

    .toast-message {
      font-size: 0.8rem;
      line-height: 1.4;
      word-break: break-word;
    }

    /* Close Button */
    .toast-close {
      background: transparent;
      border: none;
      border-radius: 50%;
      width: 26px;
      height: 26px;
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
