import DOMPurify from 'dompurify';

/**
 * Sanitize HTML input - removes all tags
 */
export const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize file names to prevent path traversal and special chars
 */
export const sanitizeFileName = (name: string): string => {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^\.+/, '') // Prevent hidden files
        .substring(0, 255);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    return { valid: errors.length === 0, errors };
};

/**
 * Validate file size (in bytes)
 */
export const validateFileSize = (size: number, maxSizeMB: number): boolean => {
    return size <= maxSizeMB * 1024 * 1024;
};

/**
 * Validate file extension
 */
export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(ext);
};

/**
 * Escape HTML entities to prevent XSS
 */
export const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
};
