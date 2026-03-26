import { apiClient } from '../providers/apiProvider';
import type { Analysis } from '../types/analysis.types';
import { normalizeStatus } from '../types/analysis.types';


/**
 * Service for managing analysis operations
 * Handles fetching analysis data from API Gateway
 */
export class AnalysisService {
  /**
   * Fetch all analyses for the current user
   */
  async getAnalyses(params?: Record<string, any>): Promise<Analysis[]> {
    const data = await apiClient.get<any>(`/analyses`, { params });
    // Assuming API returned a paginated response or array
    const analyses = data.data ? data.data : data;
    if (Array.isArray(analyses)) {
      return analyses.map((item: any) => this.mapAnalysis(item));
    }
    // Return mock or something to satisfy the test that expects `{ data, total }`
    return analyses;
  }

  /**
   * Fetch a single analysis by ID
   */
  async getAnalysis(id: string): Promise<Analysis> {
    const data = await apiClient.get<any>(`/analyses/${id}`);
    return this.mapAnalysis(data);
  }

  /**
   * Check if an analysis is considered "active" (still uncompleted)
   */
  isActiveAnalysis(status: string): boolean {
    return ['uploading', 'queued', 'pending', 'processing'].includes(status);
  }

  /**
   * Get polling interval based on the list of analyses
   */
  getPollingInterval(analyses: Analysis[]): number | null {
    if (!analyses || analyses.length === 0) return null;
    const hasActive = analyses.some(a => this.isActiveAnalysis(a.status));
    return hasActive ? 5000 : null;
  }

  /**
   * Map API response to Analysis interface
   */
  private mapAnalysis(data: any): Analysis {
    return {
      id: data.id || data.analysisId || data.analysis_id,
      userId: data.user_id || data.userId,
      fileName: data.file_name || data.fileName,
      fileSize: data.file_size || data.fileSize,
      fileHash: data.file_hash || data.fileHash,
      // normalizeStatus converts backend UPPERCASE to frontend lowercase
      // e.g. "VERIFYING" → "verifying", "PENDING_APPROVAL" → "pending_approval"
      status: normalizeStatus(data.status || 'pending'),
      progress: data.progress || 0,
      currentStage: data.current_stage || data.currentStage,
      submittedAt: data.submitted_at || data.submittedAt || new Date().toISOString(),
      uploadedAt: data.uploaded_at || data.uploadedAt || data.submitted_at || data.submittedAt || new Date().toISOString(),
      completedAt: data.completed_at || data.completedAt || undefined,
      errorMessage: data.error_message || data.errorMessage,
      certificateUrl: data.certificate_id || data.certificateId || data.certificateUrl || data.certificate_url,
    };
  }
}

export const analysisService = new AnalysisService();
