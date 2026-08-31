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
      let errorMessage = 'An unexpected error occurred';

      if (error.error?.error?.message) {
        errorMessage = error.error.error.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }

      if (error.status === 401 && !req.url.includes('/auth/login')) {
        notification.error('Session Expired', 'Please sign in again.');
        localStorage.removeItem('pulse_access_token');
        localStorage.removeItem('pulse_refresh_token');
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        notification.error('Access Denied', 'You do not have permission for this action.');
      } else if (error.status === 0) {
        notification.error('Network Error', 'Cannot connect to backend server. Ensure backend is running.');
      } else {
        notification.error('Error', errorMessage);
      }

      return throwError(() => error);
    })
  );
};
