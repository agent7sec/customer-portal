import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalysisService } from './AnalysisService';
import type { Analysis, AnalysisStatus } from '../types/analysis.types';
import { apiClient } from '../providers/apiProvider';

vi.mock('../providers/apiProvider', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe('AnalysisService', () => {
    let service: AnalysisService;

    beforeEach(() => {
        service = new AnalysisService();
        vi.clearAllMocks();
    });

    describe('getAnalyses', () => {
        it('should fetch analyses with default parameters', async () => {
            const mockResponse = {
                data: [
                    {
                        id: '1',
                        userId: 'user1',
                        fileName: 'test.zip',
                        fileSize: 1024,
                        status: 'completed',
                        progress: 100,
                        uploadedAt: '2024-01-01T00:00:00Z',
                    },
                ],
                total: 1,
            };

            vi.mocked(apiClient.get).mockResolvedValue(mockResponse.data);

            const result = await service.getAnalyses();

            expect(apiClient.get).toHaveBeenCalledWith('/analyses', {
                params: undefined,
            });
            expect(result[0]).toMatchObject(mockResponse.data[0]);
        });

        it('should fetch analyses with pagination and filters', async () => {
            const mockResponse = [];
            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

            const params = {
                page: 2,
                limit: 20,
                status: 'processing',
            };

            await service.getAnalyses(params);

            expect(apiClient.get).toHaveBeenCalledWith('/analyses', {
                params,
            });
        });
    });

    describe('getAnalysis', () => {
        it('should fetch a specific analysis by ID', async () => {
            const mockAnalysis: Analysis = {
                id: '123',
                userId: 'user1',
                fileName: 'test.zip',
                fileSize: 2048,
                status: 'processing',
                progress: 50,
                submittedAt: '2024-01-01T00:00:00Z',
            };

            vi.mocked(apiClient.get).mockResolvedValue(mockAnalysis);

            const result = await service.getAnalysis('123');

            expect(apiClient.get).toHaveBeenCalledWith('/analyses/123');
            expect(result).toMatchObject(mockAnalysis);
        });
    });

    describe('isActiveAnalysis', () => {
        it('should return true for uploading status', () => {
            expect(service.isActiveAnalysis('uploading')).toBe(true);
        });

        it('should return true for queued status', () => {
            expect(service.isActiveAnalysis('queued')).toBe(true);
        });

        it('should return true for processing status', () => {
            expect(service.isActiveAnalysis('processing')).toBe(true);
        });

        it('should return false for completed status', () => {
            expect(service.isActiveAnalysis('completed')).toBe(false);
        });

        it('should return false for failed status', () => {
            expect(service.isActiveAnalysis('failed')).toBe(false);
        });
    });

    describe('getPollingInterval', () => {
        it('should return 5000ms when there are active analyses', () => {
            const analyses: Analysis[] = [
                {
                    id: '1',
                    userId: 'user1',
                    fileName: 'test1.zip',
                    fileSize: 1024,
                    status: 'processing',
                    progress: 50,
                    uploadedAt: '2024-01-01T00:00:00Z',
                },
                {
                    id: '2',
                    userId: 'user1',
                    fileName: 'test2.zip',
                    fileSize: 2048,
                    status: 'completed',
                    progress: 100,
                    uploadedAt: '2024-01-01T00:00:00Z',
                },
            ];

            expect(service.getPollingInterval(analyses)).toBe(5000);
        });

        it('should return null when all analyses are completed', () => {
            const analyses: Analysis[] = [
                {
                    id: '1',
                    userId: 'user1',
                    fileName: 'test1.zip',
                    fileSize: 1024,
                    status: 'completed',
                    progress: 100,
                    uploadedAt: '2024-01-01T00:00:00Z',
                },
            ];

            expect(service.getPollingInterval(analyses)).toBeNull();
        });

        it('should return null when all analyses are failed', () => {
            const analyses: Analysis[] = [
                {
                    id: '1',
                    userId: 'user1',
                    fileName: 'test1.zip',
                    fileSize: 1024,
                    status: 'failed',
                    progress: 0,
                    uploadedAt: '2024-01-01T00:00:00Z',
                    errorMessage: 'Analysis failed',
                },
            ];

            expect(service.getPollingInterval(analyses)).toBeNull();
        });

        it('should return 5000ms when there is at least one queued analysis', () => {
            const analyses: Analysis[] = [
                {
                    id: '1',
                    userId: 'user1',
                    fileName: 'test1.zip',
                    fileSize: 1024,
                    status: 'queued',
                    progress: 0,
                    uploadedAt: '2024-01-01T00:00:00Z',
                },
                {
                    id: '2',
                    userId: 'user1',
                    fileName: 'test2.zip',
                    fileSize: 2048,
                    status: 'completed',
                    progress: 100,
                    uploadedAt: '2024-01-01T00:00:00Z',
                },
            ];

            expect(service.getPollingInterval(analyses)).toBe(5000);
        });

        it('should return null for empty analyses array', () => {
            expect(service.getPollingInterval([])).toBeNull();
        });
    });
});
