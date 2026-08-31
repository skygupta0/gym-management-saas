import { AbstractControl, FormGroup } from '@angular/forms';

export class FormErrorUtil {
  /**
   * Generates a user-friendly error message for a form control.
   */
  static getErrorMessage(control: AbstractControl | null, fieldLabel: string): string | null {
    if (!control || !control.errors || (!control.touched && !control.dirty)) {
      return null;
    }

    const errors = control.errors;

    if (errors['serverError']) {
      return errors['serverError'];
    }

    if (errors['required']) {
      return `${fieldLabel} is required`;
    }

    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    if (errors['minlength']) {
      return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters`;
    }

    if (errors['maxlength']) {
      return `${fieldLabel} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }

    if (errors['pattern']) {
      return `Invalid ${fieldLabel} format`;
    }

    return `${fieldLabel} is invalid`;
  }

  /**
   * Parses backend validation errors from HTTP 400 responses
   * and maps them to relevant form fields.
   * Returns true if field errors were applied, false if general error.
   */
  static applyServerErrors(form: FormGroup, error: any): boolean {
    const errorBody = error?.error?.error || error?.error;
    const details = errorBody?.details;

    if (Array.isArray(details) && details.length > 0) {
      let appliedAny = false;

      for (const errStr of details) {
        if (typeof errStr === 'string' && errStr.includes(':')) {
          const [field, ...rest] = errStr.split(':');
          const fieldName = field.trim();
          const message = rest.join(':').trim();

          const control = form.get(fieldName);
          if (control) {
            control.setErrors({ serverError: message });
            control.markAsTouched();
            appliedAny = true;
          }
        }
      }

      return appliedAny;
    }

    return false;
  }
}
