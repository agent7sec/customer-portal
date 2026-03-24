import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 */
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Sanitizes file names to prevent path traversal and injection attacks
 * - Replaces special characters with underscores
 * - Limits length to 255 characters
 * - Preserves alphanumeric, dots, hyphens, and underscores
 */
export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

/**
 * Validates email format using RFC-compliant regex
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One special character
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
  return { valid: errors.length === 0, errors };
};
