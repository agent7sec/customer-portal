import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import type { PresignedUrlResponse, UploadCompleteResponse } from '../types/upload.types';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types/upload.types';
import { sanitizeFileName } from '../utils/validation';

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

class UploadService {
    validateFile(file: File): FileValidationResult {
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            };
        }

        const fileName = file.name.toLowerCase();
        const hasValidExtension = ALLOWED_FILE_TYPES.some((ext) => fileName.endsWith(ext));

        if (!hasValidExtension) {
            return {
                valid: false,
                error: `File type not supported. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`,
            };
        }

        return { valid: true };
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
        return {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    async getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResponse> {
            // Sanitize file name to prevent path traversal and other attacks
            const sanitizedFileName = sanitizeFileName(fileName);

            const headers = await this.getAuthHeaders();
            const response = await axios.post(
                `${config.api.baseUrl}/uploads/presigned-url`,
                { file_name: sanitizedFileName, content_type: contentType },
                { headers }
            );
            return {
                uploadUrl: response.data.upload_url,
                fileKey: response.data.file_key,
                analysisId: response.data.analysis_id,
                expiresAt: new Date(response.data.expires_at),
            };
        }

    async uploadToS3(
        url: string,
        file: File,
        onProgress?: (percent: number) => void,
        maxRetries: number = 3
    ): Promise<void> {
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                await axios.put(url, file, {
                    headers: { 'Content-Type': file.type || 'application/octet-stream' },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total && onProgress) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percent);
                        }
                    },
                    timeout: 300000, // 5 minutes timeout
                });
                return; // Success, exit retry loop
            } catch (error: any) {
                lastError = error;
                
                // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
                if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
                    if (error.response.status !== 408 && error.response.status !== 429) {
                        throw error;
                    }
                }
                
                // If this is not the last attempt, wait before retrying with exponential backoff
                if (attempt < maxRetries - 1) {
                    const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
                    await new Promise(resolve => setTimeout(resolve, backoffMs));
                }
            }
        }
        
        // All retries failed
        throw lastError || new Error('Upload failed after multiple retries');
    }

    async notifyUploadComplete(analysisId: string, fileKey: string): Promise<UploadCompleteResponse> {
        const headers = await this.getAuthHeaders();
        const response = await axios.post(
            `${config.api.baseUrl}/uploads/complete`,
            { analysis_id: analysisId, file_key: fileKey },
            { headers }
        );
        return {
            analysisId: response.data.analysis_id,
            status: response.data.status,
        };
    }

    async cancelUpload(fileKey: string): Promise<void> {
        const headers = await this.getAuthHeaders();
        await axios.delete(`${config.api.baseUrl}/uploads/${fileKey}`, { headers });
    }
}

export const uploadService = new UploadService();
