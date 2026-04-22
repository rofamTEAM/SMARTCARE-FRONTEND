/**
 * Input Validation Utilities
 * Provides CORS-safe input validation and sanitization
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule | ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Email validation pattern (RFC 5322 simplified)
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation pattern
 * At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s])[\S]{8,}$/;

/**
 * Phone number pattern (international format)
 */
export const PHONE_PATTERN = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

/**
 * Validate a single field against rules
 */
export function validateField(
  value: any,
  rules: ValidationRule | ValidationRule[]
): string[] {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  const errors: string[] = [];

  for (const rule of ruleArray) {
    // Check required
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push(rule.message || 'This field is required');
      continue;
    }

    if (!value) continue;

    // Check minLength
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(
        rule.message || `Minimum length is ${rule.minLength} characters`
      );
    }

    // Check maxLength
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(
        rule.message || `Maximum length is ${rule.maxLength} characters`
      );
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || 'Invalid format');
    }

    // Check custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        errors.push(
          typeof result === 'string' ? result : (rule.message || 'Validation failed')
        );
      }
    }
  }

  return errors;
}

/**
 * Validate multiple fields
 */
export function validateFields(
  data: Record<string, any>,
  rules: ValidationRules
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldErrors = validateField(data[field], fieldRules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize object input
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    }
  }

  return sanitized;
}

/**
 * Common validation rules
 */
export const CommonRules = {
  email: {
    required: true,
    pattern: EMAIL_PATTERN,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    pattern: PASSWORD_PATTERN,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters',
  },
  phone: {
    required: true,
    pattern: PHONE_PATTERN,
    message: 'Please enter a valid phone number',
  },
};
