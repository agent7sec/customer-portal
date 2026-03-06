import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import type { Certificate, CertificateDownloadResponse } from '../types/certificate.types';

class CertificateService {
    private async getHeaders(): Promise<Record<string, string>> {
        const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
        return {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    async getCertificates(): Promise<Certificate[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/certificates`, { headers });
        return response.data.map(this.mapCertificate);
    }

    async getCertificate(id: string): Promise<Certificate> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/certificates/${id}`, { headers });
        return this.mapCertificate(response.data);
    }

    async getDownloadUrl(id: string): Promise<CertificateDownloadResponse> {
        const headers = await this.getHeaders();
        const response = await axios.get(
            `${config.api.baseUrl}/certificates/${id}/download`,
            { headers }
        );
        return {
            url: response.data.url,
            expiresAt: new Date(response.data.expires_at),
        };
    }

    async downloadCertificate(id: string, fileName?: string): Promise<void> {
        const { url } = await this.getDownloadUrl(id);

        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `certificate-${id}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    private mapCertificate(data: any): Certificate {
        return {
            id: data.id,
            analysisId: data.analysis_id,
            userId: data.user_id,
            fileName: data.file_name,
            generatedAt: new Date(data.generated_at),
            expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
            fileSize: data.file_size,
            downloadCount: data.download_count,
        };
    }
}

export const certificateService = new CertificateService();
