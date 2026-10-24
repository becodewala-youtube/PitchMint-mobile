import {
  validateName,
  validateEmail,
  validatePassword,
  validateVerificationCode,
  validateResetToken,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateName', () => {
    it('should fail on empty or whitespace name', () => {
      expect(validateName('').isValid).toBe(false);
      expect(validateName('   ').isValid).toBe(false);
    });

    it('should fail on name shorter than 2 chars', () => {
      expect(validateName('A').isValid).toBe(false);
      expect(validateName('A').error).toBe('Name must be between 2 and 50 characters');
    });

    it('should fail on name longer than 50 chars', () => {
      const longName = 'A'.repeat(51);
      expect(validateName(longName).isValid).toBe(false);
    });

    it('should pass on valid name', () => {
      expect(validateName('Aarav Sharma').isValid).toBe(true);
      expect(validateName('Aarav Sharma').error).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should fail on empty email', () => {
      expect(validateEmail('').isValid).toBe(false);
    });

    it('should fail on invalid email structures', () => {
      expect(validateEmail('notanemail').isValid).toBe(false);
      expect(validateEmail('missing@domain').isValid).toBe(false);
      expect(validateEmail('@missinguser.com').isValid).toBe(false);
    });

    it('should pass on valid emails', () => {
      expect(validateEmail('founder@pitchmint.app').isValid).toBe(true);
      expect(validateEmail('test.user+tag@domain.co').isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should fail on empty password', () => {
      expect(validatePassword('').isValid).toBe(false);
    });

    it('should fail when password is less than 8 characters', () => {
      const res = validatePassword('Aa1@');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Password must be at least 8 characters long');
    });

    it('should fail when missing lowercase letter', () => {
      const res = validatePassword('PASSWORD123!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('lowercase letter');
    });

    it('should fail when missing uppercase letter', () => {
      const res = validatePassword('password123!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('uppercase letter');
    });

    it('should fail when missing number', () => {
      const res = validatePassword('PasswordSpecial!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('number');
    });

    it('should fail when missing special character', () => {
      const res = validatePassword('Password1234');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('special character');
    });

    it('should pass on fully compliant password', () => {
      expect(validatePassword('StrongPass123!').isValid).toBe(true);
      expect(validatePassword('Super@Secret99').isValid).toBe(true);
      expect(validatePassword('P@ssword1').isValid).toBe(true);
    });
  });

  describe('validateVerificationCode', () => {
    it('should fail on empty or non-6-digit codes', () => {
      expect(validateVerificationCode('').isValid).toBe(false);
      expect(validateVerificationCode('12345').isValid).toBe(false);
      expect(validateVerificationCode('1234567').isValid).toBe(false);
      expect(validateVerificationCode('abcdef').isValid).toBe(false);
    });

    it('should pass on exactly 6 digits', () => {
      expect(validateVerificationCode('123456').isValid).toBe(true);
      expect(validateVerificationCode('999999').isValid).toBe(true);
    });
  });

  describe('validateResetToken', () => {
    it('should fail on empty or short token', () => {
      expect(validateResetToken('').isValid).toBe(false);
      expect(validateResetToken('123').isValid).toBe(false);
    });

    it('should pass on valid reset token', () => {
      expect(validateResetToken('a1b2c3d4e5f6').isValid).toBe(true);
      expect(validateResetToken('e74a810b50302b13c7a0d4f3e6912345').isValid).toBe(true);
    });
  });
});
