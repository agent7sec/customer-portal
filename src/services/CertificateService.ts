import { apiClient } from '../providers/apiProvider';
import type { Certificate, CertificateDownloadResponse } from '../types/certificate.types';

/**
 * Service for certificate operations
 * Handles certificate retrieval and secure download with pre-signed URLs
 */
export class CertificateService {
    /**
     * Get all certificates for the current user
     */
    async getCertificates(params?: {
        page?: number;
        limit?: number;
        analysisId?: string;
    }): Promise<{ data: Certificate[]; total: number }> {
        const response = await apiClient.get('/certificates', { params });
        return {
            data: response.data || response.items || [],
            total: response.total || response.data?.length || 0,
        };
    }

    /**
     * Get a specific certificate by ID
     */
    async getCertificate(id: string): Promise<Certificate> {
        const response = await apiClient.get(`/certificates/${id}`);
        return response.data || response;
    }

    /**
     * Request a secure download URL for a certificate
     * Returns a pre-signed S3 URL with time expiration
     */
    async getDownloadUrl(certificateId: string): Promise<CertificateDownloadResponse> {
        const response = await apiClient.post(`/certificates/${certificateId}/download`);
        return {
            url: response.url || response.data?.url,
            expiresAt: new Date(response.expiresAt || response.data?.expiresAt),
        };
    }

    /**
     * Download a certificate file
     * Validates authorization and initiates download
     */
    async downloadCertificate(certificateId: string, fileName: string): Promise<void> {
        // Get pre-signed URL from backend
        const { url } = await this.getDownloadUrl(certificateId);

        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Validate if user is authorized to download a certificate
     */
    async validateDownloadAuthorization(certificateId: string): Promise<boolean> {
        try {
            await apiClient.get(`/certificates/${certificateId}/validate`);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const certificateService = new CertificateService();
