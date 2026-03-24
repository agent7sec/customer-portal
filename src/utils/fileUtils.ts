/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Validate file size against maximum allowed
 */
export const isFileSizeValid = (bytes: number, maxBytes: number): boolean => {
    return bytes > 0 && bytes <= maxBytes;
};

/**
 * Validate file type against allowed types
 */
export const isFileTypeValid = (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(`.${extension}`) : false;
};

/**
 * Sanitize file name by removing special characters
 */
export const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};
