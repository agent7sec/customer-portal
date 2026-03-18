export interface UploadFile {
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    error?: string;
    fileKey?: string;
    analysisId?: string;
}

export interface PresignedUrlResponse {
    uploadUrl: string;
    fileKey: string;
    analysisId: string;
    expiresAt: Date;
}

export interface UploadCompleteResponse {
    analysisId: string;
    status: string;
}

export const ALLOWED_FILE_TYPES = ['.zip', '.tar.gz', '.jar', '.war', '.tgz'];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
