/**
 * Form validation. Validators return an error *message key* (localized by the UI) or null.
 * The backend will re-validate everything; these checks exist for fast, friendly feedback.
 */

export type ValidationError =
  | 'errorRequired'
  | 'errorPhone'
  | 'errorOtp'
  | 'errorName'
  | 'errorTooLong'
  | 'errorPincode'
  | 'errorTimeRange'
  | 'errorRating'
  | 'errorConsent';

/** Strip spaces, dashes and an optional +91 / 0 prefix. */
export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/[\s-]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, '');
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export function required(value: string): ValidationError | null {
  return value.trim() ? null : 'errorRequired';
}

export function phone(value: string): ValidationError | null {
  if (!value.trim()) return 'errorRequired';
  return normalizeIndianMobile(value) ? null : 'errorPhone';
}

/** Optional phone: empty is fine, otherwise must be a valid Indian mobile number. */
export function optionalPhone(value: string): ValidationError | null {
  return value.trim() ? phone(value) : null;
}

export function otp(value: string): ValidationError | null {
  return /^\d{6}$/.test(value.trim()) ? null : 'errorOtp';
}

/** Letters (Latin or Devanagari), spaces, dots, apostrophes and hyphens; 2-80 characters. */
export function personName(value: string): ValidationError | null {
  const v = value.trim();
  if (!v) return 'errorRequired';
  return /^[\p{L}\p{M} .'-]{2,80}$/u.test(v) ? null : 'errorName';
}

export function maxLength(limit: number) {
  return (value: string): ValidationError | null =>
    value.trim().length > limit ? 'errorTooLong' : null;
}

export function optionalPincode(value: string): ValidationError | null {
  const v = value.trim();
  return !v || /^[1-9]\d{5}$/.test(v) ? null : 'errorPincode';
}

function minutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function timeRange(open: string, close: string): ValidationError | null {
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!valid.test(open) || !valid.test(close)) return 'errorTimeRange';
  return minutes(open) < minutes(close) ? null : 'errorTimeRange';
}

export function rating(value: number): ValidationError | null {
  return Number.isInteger(value) && value >= 1 && value <= 5 ? null : 'errorRating';
}

export function consent(accepted: boolean): ValidationError | null {
  return accepted ? null : 'errorConsent';
}

/** Run validators for each field; returns only the fields that failed. */
export function validate<T extends object>(rules: {
  [K in keyof T]?: () => ValidationError | null;
}): Partial<Record<keyof T, ValidationError>> {
  const errors: Partial<Record<keyof T, ValidationError>> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const error = rules[key]?.();
    if (error) errors[key] = error;
  }
  return errors;
}
