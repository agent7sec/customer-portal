export interface UploadFile {
    id: string;
    name: string;
    size: number;
    type: string;
    /** Phase 5 spec statuses: 'hashing' and 'saving' are intermediate states */
    status: 'pending' | 'hashing' | 'uploading' | 'saving' | 'completed' | 'failed';
    progress: number;
    error?: string;
    /** SHA-256 hex string calculated client-side before upload */
    hash?: string;
    fileKey?: string;
    analysisId?: string;
}

export interface PresignedUrlResponse {
    uploadUrl: string;
    fileKey: string;
    /** Some backends return analysisId; may be undefined if using hash-based lookup */
    analysisId?: string;
    expiresAt: Date;
}

export interface UploadCompleteResponse {
    analysisId: string;
    status: string;
}

// ── DynamoDB Analysis Record (Phase 5.7 API Contract) ────────────────────────

export interface AnalysisRecord {
    analysisId: string;         // UUID primary key
    tenantId: string;           // Partition key – enables tenant isolation (RLS)
    userId: string;
    fileHash: string;           // SHA-256 (FileHashIndex GSI partition key)
    fileName: string;
    fileSize: number;
    fileKey: string;            // S3 object key
    status: 'UPLOADED' | 'VERIFYING' | 'PROCESSING' | 'ANALYZING' | 'PENDING_APPROVAL' | 'COMPLETED' | 'FAILED';
    createdAt: string;          // ISO timestamp
    updatedAt: string;
}

export interface CreateAnalysisRequest {
    fileName: string;
    fileSize: number;
    /** SHA-256 hex string – required for the FileHashIndex GSI */
    fileHash: string;
    fileKey: string;
    tenantId: string;
}

export interface CreateAnalysisResponse {
    analysisId: string;
    fileHash: string;
    fileName: string;
    fileSize: number;
    status: 'UPLOADED';
    createdAt: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const ALLOWED_FILE_TYPES = ['.zip', '.tar.gz', '.jar', '.war', '.tgz'];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
