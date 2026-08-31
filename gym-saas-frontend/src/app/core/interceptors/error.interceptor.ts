import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorData = error.error?.error || error.error;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message || error.message || 'An unexpected error occurred';
      const details = errorData?.details;

      // 1. If it is a field-level validation error (VAL_001), let the form display field errors directly
      const isFieldValidation = errorCode === 'VAL_001' || (Array.isArray(details) && details.some(d => typeof d === 'string' && d.includes(':')));

      if (isFieldValidation) {
        // Suppress toast so individual form controls show the inline error
        return throwError(() => error);
      }

      // 2. Handle unauthorized session expiry
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        notification.error('Session Expired', 'Please sign in again.');
        localStorage.removeItem('pulse_access_token');
        localStorage.removeItem('pulse_refresh_token');
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      // 3. Handle specific HTTP status codes with rich toasts
      if (error.status === 403) {
        notification.error('Access Denied', errorMessage || 'You do not have permission for this action.');
      } else if (error.status === 404) {
        notification.error('Not Found', errorMessage || 'The requested resource was not found.');
      } else if (error.status === 409) {
        notification.warning('Conflict', errorMessage || 'Resource already exists.');
      } else if (error.status === 0) {
        notification.error('Network Offline', 'Cannot connect to backend server. Please verify the server is running.');
      } else {
        // Business logic or server error
        notification.error('Operation Failed', errorMessage);
      }

      return throwError(() => error);
    })
  );
};
