import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeFileName, validateEmail, validatePassword } from './validation';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello');
  });

  it('should remove dangerous attributes', () => {
    const input = '<img src="x" onerror="alert(1)">Test';
    const result = sanitizeInput(input);
    expect(result).toBe('Test');
  });

  it('should preserve plain text', () => {
    const input = 'Hello World';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World');
  });
});

describe('sanitizeFileName', () => {
  it('should replace special characters with underscores', () => {
    const input = 'my file@name#test.zip';
    const result = sanitizeFileName(input);
    expect(result).toBe('my_file_name_test.zip');
  });

  it('should collapse multiple underscores', () => {
    const input = 'file___name.txt';
    const result = sanitizeFileName(input);
    expect(result).toBe('file_name.txt');
  });

  it('should preserve valid characters', () => {
    const input = 'valid-file_name.123.zip';
    const result = sanitizeFileName(input);
    expect(result).toBe('valid-file_name.123.zip');
  });

  it('should limit length to 255 characters', () => {
    const input = 'a'.repeat(300) + '.txt';
    const result = sanitizeFileName(input);
    expect(result.length).toBe(255);
  });

  it('should handle path traversal attempts', () => {
    const input = '../../../etc/passwd';
    const result = sanitizeFileName(input);
    expect(result).toBe('.._.._.._etc_passwd');
  });
});

describe('validateEmail', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user @example.com')).toBe(false);
    expect(validateEmail('user@example')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject passwords that are too short', () => {
    const result = validatePassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least 8 characters');
  });

  it('should reject passwords without uppercase letters', () => {
    const result = validatePassword('lowercase1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('One uppercase letter');
  });

  it('should reject passwords without lowercase letters', () => {
    const result = validatePassword('UPPERCASE1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('One lowercase letter');
  });

  it('should reject passwords without numbers', () => {
    const result = validatePassword('NoNumbers!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('One number');
  });

  it('should reject passwords without special characters', () => {
    const result = validatePassword('NoSpecial1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('One special character');
  });

  it('should return all validation errors', () => {
    const result = validatePassword('weak');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
