export type AnalysisStatus =
  | 'pending'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Analysis {
  id: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  status: AnalysisStatus;
  progress?: number;
  currentStage?: string;
  submittedAt?: string;
  uploadedAt: string;
  completedAt?: string;
  certificateUrl?: string;
  errorMessage?: string;
}

export const STATUS_LABELS: Record<AnalysisStatus, string> = {
  pending: 'Pending',
  uploading: 'Uploading',
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export const STATUS_COLORS: Record<AnalysisStatus, string> = {
  pending: 'default',
  uploading: 'blue',
  queued: 'default',
  processing: 'processing',
  completed: 'success',
  failed: 'error',
};

export const ANALYSIS_STAGES = [
  'File Upload',
  'Security Scan',
  'Code Analysis',
  'Report Generation',
  'Certificate Creation',
];
