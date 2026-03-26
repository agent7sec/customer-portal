/**
 * Calculate SHA-256 hash of a file using the Web Crypto API (no external deps).
 * The hash is used as a unique file identifier in DynamoDB (FileHashIndex GSI)
 * and is required by the POST /analyses backend contract.
 *
 * @param file - The File object to hash
 * @returns Hex-encoded SHA-256 string (64 characters)
 */
export async function calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Format a SHA-256 hex string for display (first 16 chars + ellipsis).
 */
export function truncateHash(hash: string, length = 16): string {
    return `${hash.substring(0, length)}...`;
}
