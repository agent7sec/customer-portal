import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { uploadService } from './UploadService';
import { auth0Service } from './Auth0Service';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types/upload.types';

// Mock dependencies
vi.mock('axios');
vi.mock('./Auth0Service');
vi.mock('../config/env', () => ({
    config: {
        api: {
            baseUrl: 'https://api.example.com',
        },
    },
}));

const mockedAxios = vi.mocked(axios);
const mockedAuth0Service = vi.mocked(auth0Service);

describe('UploadService', () => {
    const mockTokens = {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        expiresAt: Date.now() + 3600000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuth0Service.getTokens.mockReturnValue(mockTokens);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('validateFile', () => {
        it('should validate file size within limit', () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

            const result = uploadService.validateFile(file);

            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should reject file exceeding size limit', () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE + 1 });

            const result = uploadService.validateFile(file);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('exceeds');
        });

        it('should validate allowed file types', () => {
            ALLOWED_FILE_TYPES.forEach(ext => {
                const file = new File(['content'], `test${ext}`, { type: 'application/octet-stream' });
                Object.defineProperty(file, 'size', { value: 1024 });

                const result = uploadService.validateFile(file);

                expect(result.valid).toBe(true);
            });
        });

        it('should reject unsupported file types', () => {
            const file = new File(['content'], 'test.txt', { type: 'text/plain' });
            Object.defineProperty(file, 'size', { value: 1024 });

            const result = uploadService.validateFile(file);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('not supported');
        });

        it('should handle case-insensitive file extensions', () => {
            const file = new File(['content'], 'test.ZIP', { type: 'application/zip' });
            Object.defineProperty(file, 'size', { value: 1024 });

            const result = uploadService.validateFile(file);

            expect(result.valid).toBe(true);
        });
    });

    describe('getPresignedUrl', () => {
        it('should request pre-signed URL successfully', async () => {
            const mockResponse = {
                data: {
                    upload_url: 'https://s3.amazonaws.com/bucket/key?signature=xyz',
                    file_key: 'uploads/user123/file.zip',
                    analysis_id: 'analysis_123',
                    expires_at: new Date().toISOString(),
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await uploadService.getPresignedUrl('test.zip', 'application/zip');

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.example.com/uploads/presigned-url',
                { file_name: 'test.zip', content_type: 'application/zip' },
                {
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                        'Content-Type': 'application/json',
                    },
                }
            );

            expect(result.uploadUrl).toBe(mockResponse.data.upload_url);
            expect(result.fileKey).toBe(mockResponse.data.file_key);
            expect(result.analysisId).toBe(mockResponse.data.analysis_id);
            expect(result.expiresAt).toBeInstanceOf(Date);
        });

        it('should handle API errors', async () => {
            mockedAxios.post.mockRejectedValue(new Error('API Error'));

            await expect(uploadService.getPresignedUrl('test.zip', 'application/zip'))
                .rejects.toThrow('API Error');
        });
    });

    describe('uploadToS3', () => {
        it('should upload file to S3 successfully', async () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            const url = 'https://s3.amazonaws.com/bucket/key';
            const onProgress = vi.fn();

            mockedAxios.put.mockResolvedValue({ data: {} });

            await uploadService.uploadToS3(url, file, onProgress);

            expect(mockedAxios.put).toHaveBeenCalledWith(
                url,
                file,
                expect.objectContaining({
                    headers: { 'Content-Type': 'application/zip' },
                    timeout: 300000,
                })
            );
        });

        it('should track upload progress', async () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            const url = 'https://s3.amazonaws.com/bucket/key';
            const onProgress = vi.fn();

            mockedAxios.put.mockImplementation((url, data, config) => {
                // Simulate progress events
                if (config?.onUploadProgress) {
                    config.onUploadProgress({ loaded: 50, total: 100 });
                    config.onUploadProgress({ loaded: 100, total: 100 });
                }
                return Promise.resolve({ data: {} });
            });

            await uploadService.uploadToS3(url, file, onProgress);

            expect(onProgress).toHaveBeenCalledWith(50);
            expect(onProgress).toHaveBeenCalledWith(100);
        });

        it('should retry on network failures', async () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            const url = 'https://s3.amazonaws.com/bucket/key';

            // Fail twice, then succeed
            mockedAxios.put
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ data: {} });

            await uploadService.uploadToS3(url, file, undefined, 3);

            expect(mockedAxios.put).toHaveBeenCalledTimes(3);
        });

        it('should not retry on 4xx client errors', async () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            const url = 'https://s3.amazonaws.com/bucket/key';

            const error = {
                response: { status: 403 },
                message: 'Forbidden',
            };

            mockedAxios.put.mockRejectedValue(error);

            await expect(uploadService.uploadToS3(url, file, undefined, 3))
                .rejects.toMatchObject(error);

            expect(mockedAxios.put).toHaveBeenCalledTimes(1);
        });

        it('should retry on 408 timeout errors', async () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            const url = 'https://s3.amazonaws.com/bucket/key';

            const error = {
                response: { status: 408 },
                message: 'Request Timeout',
            };

            mockedAxios.put
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce({ data: {} });

            await uploadService.uploadToS3(url, file, undefined, 3);

            expect(mockedAxios.put).toHaveBeenCalledTimes(2);
        });

        it('should fail after max retries', async () => {
            const file = new File(['content'], 'test.zip', { type: 'application/zip' });
            const url = 'https://s3.amazonaws.com/bucket/key';

            mockedAxios.put.mockRejectedValue(new Error('Network error'));

            await expect(uploadService.uploadToS3(url, file, undefined, 3))
                .rejects.toThrow();

            expect(mockedAxios.put).toHaveBeenCalledTimes(3);
        });
    });

    describe('notifyUploadComplete', () => {
        it('should notify backend of upload completion', async () => {
            const mockResponse = {
                data: {
                    analysis_id: 'analysis_123',
                    status: 'queued',
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await uploadService.notifyUploadComplete('analysis_123', 'file_key_123');

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'https://api.example.com/uploads/complete',
                { analysis_id: 'analysis_123', file_key: 'file_key_123' },
                {
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                        'Content-Type': 'application/json',
                    },
                }
            );

            expect(result.analysisId).toBe('analysis_123');
            expect(result.status).toBe('queued');
        });
    });

    describe('cancelUpload', () => {
        it('should cancel upload successfully', async () => {
            mockedAxios.delete.mockResolvedValue({ data: {} });

            await uploadService.cancelUpload('file_key_123');

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                'https://api.example.com/uploads/file_key_123',
                {
                    headers: {
                        Authorization: 'Bearer mock-access-token',
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        it('should handle cancellation errors', async () => {
            mockedAxios.delete.mockRejectedValue(new Error('Cancellation failed'));

            await expect(uploadService.cancelUpload('file_key_123'))
                .rejects.toThrow('Cancellation failed');
        });
    });
});
