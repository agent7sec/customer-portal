import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CertificateService } from './CertificateService';
import { apiClient } from '../providers/apiProvider';
import type { Certificate, CertificateDownloadResponse } from '../types/certificate.types';

vi.mock('../providers/apiProvider', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('CertificateService', () => {
    let service: CertificateService;

    beforeEach(() => {
        service = new CertificateService();
        vi.clearAllMocks();
    });

    describe('getCertificates', () => {
        it('should fetch certificates with default parameters', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 'cert-1',
                        analysisId: 'analysis-1',
                        userId: 'user-1',
                        fileName: 'certificate.pdf',
                        generatedAt: new Date('2024-01-01'),
                        fileSize: 1024,
                    },
                ],
                total: 1,
            };

            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

            const result = await service.getCertificates();

            expect(apiClient.get).toHaveBeenCalledWith('/certificates', { params: undefined });
            expect(result).toEqual(mockResponse);
        });

        it('should fetch certificates with pagination and filters', async () => {
            const mockResponse = { data: [], total: 0 };
            vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

            const params = {
                page: 2,
                limit: 20,
                analysisId: 'analysis-123',
            };

            await service.getCertificates(params);

            expect(apiClient.get).toHaveBeenCalledWith('/certificates', { params });
        });

        it('should handle empty response', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({});

            const result = await service.getCertificates();

            expect(result).toEqual({ data: [], total: 0 });
        });
    });

    describe('getCertificate', () => {
        it('should fetch a specific certificate by ID', async () => {
            const mockCertificate: Certificate = {
                id: 'cert-1',
                analysisId: 'analysis-1',
                userId: 'user-1',
                fileName: 'certificate.pdf',
                generatedAt: new Date('2024-01-01'),
                fileSize: 2048,
            };

            vi.mocked(apiClient.get).mockResolvedValue({ data: mockCertificate });

            const result = await service.getCertificate('cert-1');

            expect(apiClient.get).toHaveBeenCalledWith('/certificates/cert-1');
            expect(result).toEqual(mockCertificate);
        });

        it('should handle response without data wrapper', async () => {
            const mockCertificate: Certificate = {
                id: 'cert-1',
                analysisId: 'analysis-1',
                userId: 'user-1',
                fileName: 'certificate.pdf',
                generatedAt: new Date('2024-01-01'),
                fileSize: 2048,
            };

            vi.mocked(apiClient.get).mockResolvedValue(mockCertificate);

            const result = await service.getCertificate('cert-1');

            expect(result).toEqual(mockCertificate);
        });
    });

    describe('getDownloadUrl', () => {
        it('should request and return a pre-signed download URL', async () => {
            const mockResponse: CertificateDownloadResponse = {
                url: 'https://s3.amazonaws.com/bucket/certificate.pdf?signature=xyz',
                expiresAt: new Date('2024-01-01T12:00:00Z'),
            };

            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await service.getDownloadUrl('cert-1');

            expect(apiClient.post).toHaveBeenCalledWith('/certificates/cert-1/download');
            expect(result.url).toBe(mockResponse.url);
            expect(result.expiresAt).toBeInstanceOf(Date);
        });

        it('should handle response with data wrapper', async () => {
            const mockResponse = {
                data: {
                    url: 'https://s3.amazonaws.com/bucket/certificate.pdf',
                    expiresAt: '2024-01-01T12:00:00Z',
                },
            };

            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await service.getDownloadUrl('cert-1');

            expect(result.url).toBe(mockResponse.data.url);
            expect(result.expiresAt).toBeInstanceOf(Date);
        });
    });

    describe('downloadCertificate', () => {
        let mockLink: HTMLAnchorElement;

        beforeEach(() => {
            mockLink = {
                href: '',
                download: '',
                style: { display: '' },
                click: vi.fn(),
            } as any;

            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should download certificate with pre-signed URL', async () => {
            const mockUrl = 'https://s3.amazonaws.com/bucket/certificate.pdf';
            vi.mocked(apiClient.post).mockResolvedValue({
                url: mockUrl,
                expiresAt: new Date(),
            });

            await service.downloadCertificate('cert-1', 'certificate.pdf');

            expect(apiClient.post).toHaveBeenCalledWith('/certificates/cert-1/download');
            expect(mockLink.href).toBe(mockUrl);
            expect(mockLink.download).toBe('certificate.pdf');
            expect(mockLink.click).toHaveBeenCalled();
            expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
            expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
        });

        it('should throw error if download URL request fails', async () => {
            vi.mocked(apiClient.post).mockRejectedValue(new Error('Unauthorized'));

            await expect(
                service.downloadCertificate('cert-1', 'certificate.pdf')
            ).rejects.toThrow('Unauthorized');

            expect(mockLink.click).not.toHaveBeenCalled();
        });
    });

    describe('validateDownloadAuthorization', () => {
        it('should return true if user is authorized', async () => {
            vi.mocked(apiClient.get).mockResolvedValue({ authorized: true });

            const result = await service.validateDownloadAuthorization('cert-1');

            expect(apiClient.get).toHaveBeenCalledWith('/certificates/cert-1/validate');
            expect(result).toBe(true);
        });

        it('should return false if user is not authorized', async () => {
            vi.mocked(apiClient.get).mockRejectedValue(new Error('Forbidden'));

            const result = await service.validateDownloadAuthorization('cert-1');

            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

            const result = await service.validateDownloadAuthorization('cert-1');

            expect(result).toBe(false);
        });
    });
});
