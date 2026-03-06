import axios from 'axios';
import { auth0Service } from './Auth0Service';
import { config } from '../config/env';
import type { Analysis } from '../types/analysis.types';

class AnalysisService {
    private async getHeaders(): Promise<Record<string, string>> {
        const tokens = auth0Service.getTokens() || (await auth0Service.refreshSession());
        return {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    async getAnalyses(): Promise<Analysis[]> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/analyses`, { headers });
        return response.data.map(this.mapAnalysis);
    }

    async getAnalysis(id: string): Promise<Analysis> {
        const headers = await this.getHeaders();
        const response = await axios.get(`${config.api.baseUrl}/analyses/${id}`, { headers });
        return this.mapAnalysis(response.data);
    }

    async retryAnalysis(id: string): Promise<Analysis> {
        const headers = await this.getHeaders();
        const response = await axios.post(
            `${config.api.baseUrl}/analyses/${id}/retry`,
            {},
            { headers }
        );
        return this.mapAnalysis(response.data);
    }

    async deleteAnalysis(id: string): Promise<void> {
        const headers = await this.getHeaders();
        await axios.delete(`${config.api.baseUrl}/analyses/${id}`, { headers });
    }

    private mapAnalysis(data: any): Analysis {
        return {
            id: data.id,
            userId: data.user_id,
            fileName: data.file_name,
            fileSize: data.file_size,
            status: data.status,
            progress: data.progress || 0,
            currentStage: data.current_stage,
            submittedAt: new Date(data.submitted_at),
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            errorMessage: data.error_message,
            certificateId: data.certificate_id,
        };
    }
}

export const analysisService = new AnalysisService();
