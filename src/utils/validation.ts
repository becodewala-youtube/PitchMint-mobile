/**
 * Validation utilities strictly mirroring the PitchMint backend authentication contracts.
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates user full name (2 - 50 characters).
 */
export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name is required' };
  }
  if (trimmed.length < 2 || trimmed.length > 50) {
    return { isValid: false, error: 'Name must be between 2 and 50 characters' };
  }
  return { isValid: true, error: null };
};

/**
 * Validates email address format.
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please provide a valid email address' };
  }
  return { isValid: true, error: null };
};

/**
 * Validates password against backend contract:
 * - At least 8 characters
 * - At least 1 lowercase letter
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character (@$!%*?&)
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one uppercase letter' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must include at least one number' };
  }
  if (!/[@$!%*?&]/.test(password)) {
    return { isValid: false, error: 'Password must include at least one special character (@$!%*?&)' };
  }
  return { isValid: true, error: null };
};

/**
 * Validates 6-digit numeric verification code.
 */
export const validateVerificationCode = (code: string): ValidationResult => {
  const trimmed = code.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Verification code is required' };
  }
  if (!/^\d{6}$/.test(trimmed)) {
    return { isValid: false, error: 'Verification code must be exactly 6 digits' };
  }
  return { isValid: true, error: null };
};

/**
 * Validates password reset token received via email.
 */
export const validateResetToken = (token: string): ValidationResult => {
  const trimmed = token.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Reset code is required' };
  }
  if (trimmed.length < 6) {
    return { isValid: false, error: 'Invalid reset code format' };
  }
  return { isValid: true, error: null };
};
