// Analysis status types aligned with the real backend pipeline (Step Functions / DynamoDB)
// Phase 6 spec + PROJECT_SPEC.md §2.3 statuses

/** Frontend-facing status enum (lowercase, used in UI) */
export type AnalysisStatus =
  | 'pending'
  | 'uploading'
  | 'queued'
  | 'verifying'       // GuardDuty + VerifyZipLambda running
  | 'processing'      // AWS Batch / Step Functions running
  | 'analyzing'       // LLM / SAST analysis in progress
  | 'pending_approval'  // HITL pause – waiting for admin review
  | 'completed'
  | 'failed';

/** Backend status strings (UPPERCASE, as stored in DynamoDB / returned by API) */
export type BackendAnalysisStatus =
  | 'UPLOADED'
  | 'VERIFYING'
  | 'PROCESSING'
  | 'ANALYZING'
  | 'PENDING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED';

/** Normalize backend UPPERCASE status to frontend lowercase AnalysisStatus */
export const normalizeStatus = (raw: string): AnalysisStatus => {
  const map: Record<string, AnalysisStatus> = {
    UPLOADED: 'pending',
    VERIFYING: 'verifying',
    PROCESSING: 'processing',
    ANALYZING: 'analyzing',
    PENDING_APPROVAL: 'pending_approval',
    COMPLETED: 'completed',
    FAILED: 'failed',
    // Pass-through lowercase values
    pending: 'pending',
    uploading: 'uploading',
    queued: 'queued',
    verifying: 'verifying',
    processing: 'processing',
    analyzing: 'analyzing',
    pending_approval: 'pending_approval',
    completed: 'completed',
    failed: 'failed',
  };
  return map[raw] ?? 'pending';
};

export interface Analysis {
  id: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  fileHash?: string;
  status: AnalysisStatus;
  progress?: number;
  currentStage?: string;
  submittedAt?: string;
  uploadedAt: string;
  createdAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  errorMessage?: string;
}

export const STATUS_LABELS: Record<AnalysisStatus, string> = {
  pending: 'Pending',
  uploading: 'Uploading',
  queued: 'Queued',
  verifying: 'Verifying',
  processing: 'Processing',
  analyzing: 'Analyzing',
  pending_approval: 'Pending Approval',
  completed: 'Completed',
  failed: 'Failed',
};

export const STATUS_COLORS: Record<AnalysisStatus, string> = {
  pending: 'default',
  uploading: 'blue',
  queued: 'gold',
  verifying: 'purple',
  processing: 'processing',
  analyzing: 'cyan',
  pending_approval: 'orange',
  completed: 'success',
  failed: 'error',
};

export const ANALYSIS_STAGES = [
  'File Upload',
  'Security Verification',
  'Code Analysis',
  'Report Generation',
  'Certificate Creation',
];
